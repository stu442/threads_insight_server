import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ThreadsService } from '../threads/threads.service';

@Injectable()
export class InsightService {
    private readonly logger = new Logger(InsightService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly threadsService: ThreadsService,
    ) { }

    async collectAllInsights(token: string, userId: string): Promise<{ savedCount: number }> {
        this.logger.log(`Starting full insight collection for user ${userId}`);

        const posts = await this.threadsService.getAllMedia(token, userId);

        this.logger.log(`Fetched ${posts.length} posts from Threads API (full sync)`);

        let savedCount = 0;

        for (const post of posts) {
            this.logger.log(`Processing post: ${post.id}`);
            // Save or update post
            await this.prisma.post.upsert({
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

            const insightsData = await this.threadsService.getInsights(token, post.id);

            if (insightsData && insightsData.length > 0) {
                this.logger.log(`Insights found for post: ${post.id}`);
                const metrics: any = {};
                insightsData.forEach((item: any) => {
                    metrics[item.name] = item.values[0].value;
                });

                await this.prisma.insight.upsert({
                    where: { postId: post.id },
                    update: {
                        views: metrics.views || 0,
                        likes: metrics.likes || 0,
                        replies: metrics.replies || 0,
                        reposts: metrics.reposts || 0,
                        quotes: metrics.quotes || 0,
                    },
                    create: {
                        postId: post.id,
                        views: metrics.views || 0,
                        likes: metrics.likes || 0,
                        replies: metrics.replies || 0,
                        reposts: metrics.reposts || 0,
                        quotes: metrics.quotes || 0,
                    },
                });
                savedCount++;
            } else {
                this.logger.log(`No insights found for post: ${post.id}`);
            }
        }

        this.logger.log(`Successfully collected insights for ${savedCount} posts (full sync)`);
        return { savedCount };
    }

    async collectInsights(token: string, userId: string, limit: number = 10): Promise<{ savedCount: number }> {
        this.logger.log(`Starting insight collection for user ${userId} with limit: ${limit}`);

        const posts = await this.threadsService.getMedia(token, userId, limit);

        this.logger.log(`Fetched ${posts.length} posts from Threads API`);

        let savedCount = 0;

        for (const post of posts) {
            this.logger.log(`Processing post: ${post.id}`);
            // Save or update post
            await this.prisma.post.upsert({
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

            const insightsData = await this.threadsService.getInsights(token, post.id);

            if (insightsData && insightsData.length > 0) {
                this.logger.log(`Insights found for post: ${post.id}`);
                const metrics: any = {};
                insightsData.forEach((item: any) => {
                    metrics[item.name] = item.values[0].value;
                });

                await this.prisma.insight.upsert({
                    where: { postId: post.id },
                    update: {
                        views: metrics.views || 0,
                        likes: metrics.likes || 0,
                        replies: metrics.replies || 0,
                        reposts: metrics.reposts || 0,
                        quotes: metrics.quotes || 0,
                    },
                    create: {
                        postId: post.id,
                        views: metrics.views || 0,
                        likes: metrics.likes || 0,
                        replies: metrics.replies || 0,
                        reposts: metrics.reposts || 0,
                        quotes: metrics.quotes || 0,
                    },
                });
                savedCount++;
            } else {
                this.logger.log(`No insights found for post: ${post.id}`);
            }
        }

        this.logger.log(`Successfully collected insights for ${savedCount} posts`);
        return { savedCount };
    }

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
