import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAnalyticsReqDto } from './dto';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate length-based tags for a post based on its caption length
     * Returns tags like: len-100, len-200, len-300, len-400, len-500
     */
    private generateLengthTags(caption: string | null): string[] {
        const tags: string[] = [];
        const length = caption?.length || 0;

        // Determine which length category this post falls into
        if (length <= 100) {
            tags.push('len-100');
        } else if (length <= 200) {
            tags.push('len-200');
        } else if (length <= 300) {
            tags.push('len-300');
        } else if (length <= 400) {
            tags.push('len-400');
        } else {
            tags.push('len-500');
        }

        return tags;
    }

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

            // Generate tags based on post length
            const lengthTags = this.generateLengthTags(post.caption);
            let tags = [...lengthTags];
            let category = null;

            // Preserve any existing GPT-driven analytics (category/tags) and merge with length tags
            const existingAnalytics = await this.prisma.postAnalytics.findUnique({
                where: { postId: post.id }
            });

            if (existingAnalytics) {
                category = existingAnalytics.category;
                const existingNonLengthTags = existingAnalytics.tags.filter(t => !t.startsWith('len-'));
                const uniqueTags = new Set([...tags, ...existingNonLengthTags]);
                tags = Array.from(uniqueTags);
            }

            // Save analytics to database
            await this.prisma.postAnalytics.upsert({
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
            tags: p.analytics?.tags || [],
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

        // Calculate statistics for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const last7DaysPosts = formattedPosts.filter(p => new Date(p.timestamp) >= sevenDaysAgo);

        const totalLikes = last7DaysPosts.reduce((sum, p) => sum + p.metrics.likes, 0);
        const totalEngagement = last7DaysPosts.reduce((sum, p) => sum + p.metrics.engagement, 0);
        const avgEngagement = last7DaysPosts.length > 0
            ? totalEngagement / last7DaysPosts.length
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

        const tagStats: Record<string, { count: number; views: number; likes: number; reposts: number; replies: number }> = {};

        for (const post of posts) {
            const tags = post.analytics?.tags || [];
            const insight = post.insights[0];

            if (!insight) continue;

            for (const tag of tags) {
                if (!tagStats[tag]) {
                    tagStats[tag] = { count: 0, views: 0, likes: 0, reposts: 0, replies: 0 };
                }

                tagStats[tag].count++;
                tagStats[tag].views += insight.views || 0;
                tagStats[tag].likes += insight.likes || 0;
                tagStats[tag].reposts += insight.reposts || 0;
                tagStats[tag].replies += insight.replies || 0;
            }
        }

        const result = Object.entries(tagStats).map(([tag, stats]) => ({
            tag,
            count: stats.count,
            avgViews: stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
            avgLikes: stats.count > 0 ? Math.round(stats.likes / stats.count) : 0,
            avgReposts: stats.count > 0 ? Math.round(stats.reposts / stats.count) : 0,
            avgReplies: stats.count > 0 ? Math.round(stats.replies / stats.count) : 0,
            totalViews: stats.views,
            totalLikes: stats.likes,
            totalReposts: stats.reposts,
            totalReplies: stats.replies
        }));

        // Sort by tag name to have len-100, len-200 in order
        result.sort((a, b) => a.tag.localeCompare(b.tag));

        return result;
    }
}
