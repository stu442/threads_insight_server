import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetAnalyticsReqDto } from '../dto';
import {
    accumulateCategoryStats,
    accumulateTagStats,
    buildDateFilter,
    bucketDayOfWeekStatsKST,
    bucketHourlyStats,
    calcEngagement,
    calculateRecentStats,
    formatPosts,
    generateLengthTags,
    getPaginationInfo,
    mergeTags,
    paginateData,
    sortPosts
} from './analytics.util';
import type { Prisma } from '@prisma/client';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async analyzePosts(
        userId: string,
        postIds?: string[],
        prismaClient: PrismaClientLike = this.prisma,
    ): Promise<{ analyzedCount: number; skippedCount: number }> {
        this.logger.log(`Starting analytics calculation for user ${userId}`);

        // Fetch posts with latest insights
        const posts = await prismaClient.post.findMany({
            where: {
                userId,
                id: postIds ? { in: postIds } : undefined,
                mediaType: { not: 'REPOST_FACADE' }
            },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                }
            }
        });

        let analyzedCount = 0;
        let skippedCount = 0;

        for (const post of posts) {
            const latestInsight = post.insights[0];

            if (!latestInsight) {
                this.logger.log(`No insights found for post ${post.id}, skipping`);
                skippedCount++;
                continue;
            }

            // Calculate engagement metrics
            const { totalEngagements, engagementRate } = calcEngagement(latestInsight);

            // Generate tags based on post length
            const lengthTags = generateLengthTags(post.caption);
            let tags = [...lengthTags];
            let category = null;

            // Preserve any existing GPT-driven analytics (category/tags) and merge with length tags
            const existingAnalytics = await prismaClient.postAnalytics.findUnique({
                where: { postId: post.id }
            });

            if (existingAnalytics) {
                category = existingAnalytics.category;
                tags = mergeTags(existingAnalytics.tags, lengthTags);
            }

            // Save analytics to database
            await prismaClient.postAnalytics.upsert({
                where: { postId: post.id },
                update: {
                    engagementRate,
                    totalEngagements,
                    tags,
                    category,
                    calculatedAt: new Date()
                },
                create: {
                    postId: post.id,
                    engagementRate,
                    totalEngagements,
                    tags,
                    category
                }
            });

            this.logger.log(`Analyzed post ${post.id}: engagement rate = ${engagementRate.toFixed(2)}%, tags = ${tags.join(', ')}`);
            analyzedCount++;
        }

        this.logger.log(`Analytics calculation complete: ${analyzedCount} analyzed, ${skippedCount} skipped`);
        return { analyzedCount, skippedCount };
    }

    async getUserAnalytics(userId: string, filters: GetAnalyticsReqDto) {
        const { startDate, endDate, sortBy = 'date', sortOrder = 'desc', page = 1, pageSize = 10 } = filters;

        this.logger.log(`Fetching analytics for user ${userId}`);

        // Build date filter
        const dateFilter = buildDateFilter(startDate, endDate);

        // Get total posts count (all time)
        const totalPosts = await this.prisma.post.count({
            where: {
                userId: userId,
                mediaType: { not: 'REPOST_FACADE' }
            }
        });

        // Fetch posts with insights and analytics based on date filter
        const posts = await this.prisma.post.findMany({
            where: {
                userId: userId,
                timestamp: Object.keys(dateFilter).length ? dateFilter : undefined,
                mediaType: { not: 'REPOST_FACADE' }
            },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                },
                analytics: true
            }
        });

        // Process and format posts
        let formattedPosts = formatPosts(posts);

        // Sort posts
        formattedPosts = sortPosts(formattedPosts, sortBy, sortOrder);

        // Calculate statistics for the last 7 days
        const { totalLikes, averageEngagement } = calculateRecentStats(formattedPosts, 7);

        // Apply pagination after sorting
        const pagedPosts = paginateData(formattedPosts, page, pageSize);
        const { totalPages, hasNext, hasPrev } = getPaginationInfo(formattedPosts.length, page, pageSize);

        this.logger.log(`Analytics retrieved for user ${userId}: ${formattedPosts.length} posts in period, returning page ${page} (${pagedPosts.length} items)`);

        return {
            totalPosts, // Total posts all time
            periodStats: {
                period: {
                    from: dateFilter.gte ? dateFilter.gte.toISOString() : null, to: dateFilter.lte ? dateFilter.lte.toISOString() : null
                },
                postCount: formattedPosts.length, // Count of posts in period (unlimited)
                totalLikes,
                averageEngagement: parseFloat(averageEngagement.toFixed(2))
            },
            pagination: {
                page,
                pageSize,
                total: formattedPosts.length,
                totalPages,
                hasNext,
                hasPrev
            },
            posts: pagedPosts
        };
    }
    async getTagCorrelation(userId: string) {
        const posts = await this.prisma.post.findMany({
            where: {
                userId,
                mediaType: { not: 'REPOST_FACADE' }
            },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                },
                analytics: true
            }
        });

        const result = accumulateTagStats(
            posts.map(post => ({
                tags: post.analytics?.tags || [],
                insight: post.insights[0]
            }))
        );

        return result;
    }

    async getCategoryMetrics(userId: string) {
        const posts = await this.prisma.post.findMany({
            where: {
                userId,
                mediaType: { not: 'REPOST_FACADE' }
            },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                },
                analytics: true
            }
        });

        return accumulateCategoryStats(
            posts.map(post => ({
                category: post.analytics?.category || null,
                insight: post.insights[0]
            }))
        );
    }

    async getTimeOfDayAnalytics(userId: string) {
        const posts = await this.prisma.post.findMany({
            where: {
                userId,
                mediaType: { not: 'REPOST_FACADE' }
            },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                }
            }
        });

        return bucketHourlyStats(
            posts.map(post => ({
                timestamp: post.timestamp,
                insight: post.insights[0]
            }))
        );
    }

    async getDayOfWeekAnalytics(userId: string) {
        const posts = await this.prisma.post.findMany({
            where: {
                userId,
                mediaType: { not: 'REPOST_FACADE' }
            },
            include: {
                insights: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                }
            }
        });

        return bucketDayOfWeekStatsKST(
            posts.map(post => ({
                timestamp: post.timestamp,
                insight: post.insights[0]
            }))
        );
    }
}
