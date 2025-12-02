import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ThreadsService } from '../../../threads/threads.service';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

interface PreparedPost {
    post: any;
    metrics: {
        views: number;
        likes: number;
        replies: number;
        reposts: number;
        quotes: number;
    } | null;
}

@Injectable()
export class InsightService {
    private readonly logger = new Logger(InsightService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly threadsService: ThreadsService,
    ) { }

    // Threads 인사이트 응답에서 조회·좋아요 등 주요 지표만 숫자로 추려 반환
    private extractMetrics(insightsData: any[] | null | undefined): PreparedPost['metrics'] {
        if (!insightsData || insightsData.length === 0) {
            return null;
        }

        const metrics: any = {};
        insightsData.forEach((item: any) => {
            metrics[item.name] = item.values?.[0]?.value ?? 0;
        });

        return {
            views: metrics.views || 0,
            likes: metrics.likes || 0,
            replies: metrics.replies || 0,
            reposts: metrics.reposts || 0,
            quotes: metrics.quotes || 0,
        };
    }

    private async preparePosts(
        token: string,
        userId: string,
        options: { mode: 'full' | 'recent'; limit?: number; recentDays?: number },
    ): Promise<PreparedPost[]> {
        // full: 모든 게시글, recent: 최근 일정일 이내 게시글
        // 스레드 게시물을 가져온다.
        const posts = options.mode === 'full'
            ? await this.threadsService.getAllMedia(token, userId)
            // recentDays: 최근 일정일 이내 게시글, limit: 최대 게시글 수
            : options.recentDays
                ? await this.threadsService.getRecentMediaWithinDays(token, userId, options.recentDays, options.limit ?? 100)
                : await this.threadsService.getMedia(token, userId, options.limit ?? 10);

        this.logger.log(`Fetched ${posts.length} posts from Threads API (${options.mode} sync)`);

        const prepared: PreparedPost[] = [];

        for (const post of posts) {
            this.logger.log(`Preparing post ${post.id} for persistence`);
            // 스레드 게시글의 스레드 API 에서 가져온다.
            const insightsData = await this.threadsService.getInsights(token, post.id);
            // 인사이트 데이터에서 주요 지표를 추출한다.
            const metrics = this.extractMetrics(insightsData);
            prepared.push({ post, metrics });
        }

        return prepared;
    }

    private async persistPreparedPosts(
        preparedPosts: PreparedPost[],
        userId: string,
        prismaClient: PrismaClientLike,
        existingPostIds?: Set<string>,
    ): Promise<{ savedCount: number; postIds: string[]; createdPostIds: string[] }> {
        // 준비된 게시글+메트릭을 업서트로 DB에 반영하고 신규 게시글을 기록
        const touchedPostIds: string[] = [];
        const createdPostIds: string[] = [];
        let savedCount = 0;

        const existingIds =
            existingPostIds ??
            new Set(
                (await this.prisma.post.findMany({
                    where: { userId },
                    select: { id: true },
                })).map((p) => p.id),
            );

        for (const { post, metrics } of preparedPosts) {
            touchedPostIds.push(post.id);
            const isNewPost = !existingIds.has(post.id);

            await prismaClient.post.upsert({
                where: { id: post.id },
                update: {
                    userId: userId,
                    caption: post.text || '',
                    permalink: post.permalink,
                    mediaType: post.media_type,
                    username: post.username,
                    timestamp: new Date(post.timestamp),
                },
                create: {
                    id: post.id,
                    userId: userId,
                    caption: post.text || '',
                    permalink: post.permalink,
                    mediaType: post.media_type,
                    username: post.username,
                    timestamp: new Date(post.timestamp),
                },
            });

            if (metrics) {
                await prismaClient.insight.upsert({
                    where: { postId: post.id },
                    update: metrics,
                    create: {
                        postId: post.id,
                        ...metrics,
                    },
                });
                savedCount++;
            } else {
                this.logger.log(`No insights found for post: ${post.id}`);
            }

            if (isNewPost) {
                createdPostIds.push(post.id);
            }
        }

        return { savedCount, postIds: touchedPostIds, createdPostIds };
    }

    async collectAllInsights(
        token: string,
        userId: string,
    ): Promise<{ savedCount: number; postIds: string[]; createdPostIds: string[] }> {
        this.logger.log(`Starting full insight collection for user ${userId}`);

        // post 및 인사이트 데이터를 Threads API에서 준비
        const preparedPosts = await this.preparePosts(token, userId, { mode: 'full' });
        const existingIds = new Set(
            (await this.prisma.post.findMany({
                where: { userId },
                select: { id: true },
            })).map((p) => p.id),
        );

        const result = await this.prisma.$transaction(async (tx) =>
            // post 및 인사이트 데이터를 DB에 저장
            this.persistPreparedPosts(preparedPosts, userId, tx, existingIds),
        );

        this.logger.log(`Successfully collected insights for ${result.savedCount} posts (full sync)`);
        return {
            savedCount: result.savedCount,
            postIds: result.postIds,
            createdPostIds: result.createdPostIds,
        };
    }

    async collectInsights(
        token: string,
        userId: string,
        options?: { limit?: number; recentDays?: number },
    ): Promise<{ savedCount: number; postIds: string[]; createdPostIds: string[] }> {
        // 지정한 개수/기간으로 최신 게시글 인사이트를 수집
        const limit = options?.limit ?? 10;
        const recentDays = options?.recentDays;
        this.logger.log(`Starting insight collection for user ${userId} with limit: ${limit}`);

        // post 및 인사이트 데이터를 준비
        const preparedPosts = await this.preparePosts(token, userId, { mode: 'recent', limit, recentDays });
        const existingIds = new Set(
            (await this.prisma.post.findMany({
                where: { userId },
                select: { id: true },
            })).map((p) => p.id),
        );

        const result = await this.prisma.$transaction(async (tx) =>
            this.persistPreparedPosts(preparedPosts, userId, tx, existingIds),
        );

        this.logger.log(`Successfully collected insights for ${result.savedCount} posts`);
        return {
            savedCount: result.savedCount,
            postIds: result.postIds,
            createdPostIds: result.createdPostIds,
        };
    }

    // 특정 사용자의 최신 게시글과 가장 최근 인사이트를 함께 조회
    async getInsights(userId: string, limit: number = 10) {
        return await this.prisma.post.findMany({
            where: {
                userId: userId,
                mediaType: {
                    not: 'REPOST_FACADE'
                }
            },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1 // Get latest insight
                }
            },
            orderBy: { timestamp: 'desc' },
            take: limit
        });
    }

    // 게시글 단건과 최신 인사이트/추가 분석 정보를 조회
    async getPost(id: string) {
        return await this.prisma.post.findUnique({
            where: { id },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                },
                analytics: true
            }
        });
    }
}
