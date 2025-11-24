import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAnalyticsReqDto } from './dto';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async analyzePosts(userId: string, postIds?: string[]): Promise<{ analyzedCount: number; skippedCount: number }> {
        this.logger.log(`Starting analytics calculation for user ${userId}`);

        // Fetch posts with latest insights
        const posts = await this.prisma.post.findMany({
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
            const totalEngagements =
                (latestInsight.likes || 0) +
                (latestInsight.replies || 0) +
                (latestInsight.reposts || 0) +
                (latestInsight.quotes || 0);

            const engagementRate = (latestInsight.views || 0) > 0
                ? (totalEngagements / (latestInsight.views || 1)) * 100
                : 0;

            // Save analytics to database
            await this.prisma.postAnalytics.upsert({
                where: { postId: post.id },
                update: {
                    engagementRate,
                    totalEngagements,
                    calculatedAt: new Date()
                },
                create: {
                    postId: post.id,
                    engagementRate,
                    totalEngagements
                }
            });

            this.logger.log(`Analyzed post ${post.id}: engagement rate = ${engagementRate.toFixed(2)}%`);
            analyzedCount++;
        }

        this.logger.log(`Analytics calculation complete: ${analyzedCount} analyzed, ${skippedCount} skipped`);
        return { analyzedCount, skippedCount };
    }

    async getUserAnalytics(userId: string, filters: GetAnalyticsReqDto) {
        const { startDate, endDate, sortBy = 'date', sortOrder = 'desc', page = 1, pageSize = 10 } = filters;
        const offset = (page - 1) * pageSize;

        this.logger.log(`Fetching analytics for user ${userId}`);

        // Build date filter
        const dateFilter: any = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }

        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }

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
        let formattedPosts = posts.map(p => ({
            id: p.id,
            caption: p.caption || '',
            permalink: p.permalink,
            timestamp: p.timestamp.toISOString(),
            metrics: {
                views: p.insights[0]?.views || 0,
                likes: p.insights[0]?.likes || 0,
                replies: p.insights[0]?.replies || 0,
                reposts: p.insights[0]?.reposts || 0,
                quotes: p.insights[0]?.quotes || 0,
                engagement: parseFloat((p.analytics?.engagementRate || 0).toFixed(2))
            }
        }));

        // Sort posts
        const order = sortOrder === 'asc' ? 1 : -1;
        formattedPosts.sort((a, b) => {
            let valA, valB;
            switch (sortBy) {
                case 'views':
                    valA = a.metrics.views;
                    valB = b.metrics.views;
                    break;
                case 'likes':
                    valA = a.metrics.likes;
                    valB = b.metrics.likes;
                    break;
                case 'engagement':
                    valA = a.metrics.engagement;
                    valB = b.metrics.engagement;
                    break;
                case 'date':
                default:
                    valA = new Date(a.timestamp).getTime();
                    valB = new Date(b.timestamp).getTime();
                    break;
            }
            return (valA - valB) * order;
        });

        // Calculate statistics for the selected period (based on ALL posts in period)
        const totalLikes = formattedPosts.reduce((sum, p) => sum + p.metrics.likes, 0);
        const avgEngagement = formattedPosts.length > 0
            ? formattedPosts.reduce((sum, p) => sum + p.metrics.engagement, 0) / formattedPosts.length
            : 0;

        // Apply pagination after sorting
        const pagedPosts = formattedPosts.slice(offset, offset + pageSize);

        const totalPages = Math.ceil(formattedPosts.length / pageSize) || 1;
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        this.logger.log(`Analytics retrieved for user ${userId}: ${formattedPosts.length} posts in period, returning page ${page} (${pagedPosts.length} items)`);

        return {
            totalPosts, // Total posts all time
            periodStats: {
                period: {
                    from: dateFilter.gte ? dateFilter.gte.toISOString() : null,
                    to: dateFilter.lte ? dateFilter.lte.toISOString() : null
                },
                postCount: formattedPosts.length, // Count of posts in period (unlimited)
                totalLikes,
                averageEngagement: parseFloat(avgEngagement.toFixed(2))
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
}
