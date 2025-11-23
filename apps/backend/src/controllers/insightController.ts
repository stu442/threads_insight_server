import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ThreadsService } from '../services/threads';
import logger from '../utils/logger';
import { CollectInsightsBody } from '../types/insight';

const prisma = new PrismaClient();

export class InsightController {

    /**
     * @swagger
     * /collect:
     *   post:
     *     summary: Collect insights from Threads posts
     *     tags: [Insights]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - userId
     *             properties:
     *               token:
     *                 type: string
     *                 description: Threads API access token
     *               userId:
     *                 type: string
     *                 description: Threads user ID
     *               limit:
     *                 type: integer
     *                 default: 10
     *                 description: Number of posts to fetch
     *     responses:
     *       200:
     *         description: Successfully collected insights
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       400:
     *         description: Bad request - missing required fields
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     */
    collectInsights = async (req: Request<{}, {}, CollectInsightsBody>, res: Response) => {
        try {
            const { token, userId, limit = 10 } = req.body;

            // Validate required fields
            if (!token || !userId) {
                return res.status(400).json({
                    success: false,
                    error: 'token and userId are required in request body'
                });
            }

            logger.info(`Starting insight collection for user ${userId} with limit: ${limit}`);

            const threadsService = new ThreadsService(token, userId);
            const posts = await threadsService.getMedia(limit);

            logger.info(`Fetched ${posts.length} posts from Threads API`);

            let savedCount = 0;

            for (const post of posts) {
                logger.info(`Processing post: ${post.id}`);
                // Save or update post
                await prisma.post.upsert({
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

                const insightsData = await threadsService.getInsights(post.id);

                if (insightsData && insightsData.length > 0) {
                    logger.info(`Insights found for post: ${post.id}`);
                    const metrics: any = {};
                    insightsData.forEach((item: any) => {
                        metrics[item.name] = item.values[0].value;
                    });

                    await prisma.insight.upsert({
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
                    logger.info(`No insights found for post: ${post.id}`);
                }
            }

            logger.info(`Successfully collected insights for ${savedCount} posts`);
            res.json({ success: true, message: `Collected insights for ${savedCount} posts` });
        } catch (error) {
            logger.error('Error in collectInsights:', error);
            res.status(500).json({ success: false, error: 'Failed to collect insights' });
        }
    };

    /**
     * @swagger
     * /insights:
     *   get:
     *     summary: Retrieve posts with their latest insights for a specific user
     *     tags: [Insights]
     *     parameters:
     *       - in: query
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: Threads user ID to filter posts
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Number of posts to retrieve
     *     responses:
     *       200:
     *         description: List of posts with insights
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   userId:
     *                     type: string
     *                   caption:
     *                     type: string
     *                   permalink:
     *                     type: string
     *                   mediaType:
     *                     type: string
     *                   username:
     *                     type: string
     *                   timestamp:
     *                     type: string
     *                     format: date-time
     *                   insights:
     *                     type: array
     *                     items:
     *                       type: object
     *                       properties:
     *                         views:
     *                           type: integer
     *                         likes:
     *                           type: integer
     *                         replies:
     *                           type: integer
     *                         reposts:
     *                           type: integer
     *                         quotes:
     *                           type: integer
     *       400:
     *         description: Bad request - userId is required
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     */
    getInsights = async (req: Request, res: Response) => {
        try {
            const { userId, limit } = req.query;

            // Validate required userId parameter
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'userId is required as a query parameter'
                });
            }

            const limitValue = limit ? parseInt(limit as string) : 10;

            const insights = await prisma.post.findMany({
                where: {
                    userId: userId as string,
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
                take: limitValue
            });
            res.json(insights);
        } catch (error) {
            logger.error('Error in getInsights:', error);
            res.status(500).json({ success: false, error: 'Failed to retrieve insights' });
        }
    };

    /**
     * @swagger
     * /analyze:
     *   post:
     *     summary: Analyze posts and calculate engagement metrics
     *     tags: [Analytics]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 description: Threads user ID
     *               postIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Optional array of specific post IDs to analyze
     *     responses:
     *       200:
     *         description: Analysis completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 analyzedCount:
     *                   type: integer
     *                 skippedCount:
     *                   type: integer
     *       400:
     *         description: Bad request
     *       500:
     *         description: Server error
     */
    analyzePostsAnalytics = async (req: Request, res: Response) => {
        try {
            const { userId, postIds } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'userId is required in request body'
                });
            }

            logger.info(`Starting analytics calculation for user ${userId}`);

            // Fetch posts with latest insights
            const posts = await prisma.post.findMany({
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
                    logger.info(`No insights found for post ${post.id}, skipping`);
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
                await prisma.postAnalytics.upsert({
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

                logger.info(`Analyzed post ${post.id}: engagement rate = ${engagementRate.toFixed(2)}%`);
                analyzedCount++;
            }

            logger.info(`Analytics calculation complete: ${analyzedCount} analyzed, ${skippedCount} skipped`);
            res.json({
                success: true,
                message: `Analyzed ${analyzedCount} posts`,
                analyzedCount,
                skippedCount
            });
        } catch (error) {
            logger.error('Error in analyzePostsAnalytics:', error);
            res.status(500).json({ success: false, error: 'Failed to analyze posts' });
        }
    };

    /**
     * @swagger
     * /analytics:
     *   get:
     *     summary: Get user analytics and statistics
     *     tags: [Analytics]
     *     parameters:
     *       - in: query
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: Threads user ID
     *     responses:
     *       200:
     *         description: User analytics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     totalPosts:
     *                       type: integer
     *                     weeklyStats:
     *                       type: object
     *                       properties:
     *                         period:
     *                           type: object
     *                           properties:
     *                             from:
     *                               type: string
     *                               format: date-time
     *                             to:
     *                               type: string
     *                               format: date-time
     *                         totalPosts:
     *                           type: integer
     *                         totalLikes:
     *                           type: integer
     *                         averageEngagement:
     *                           type: number
     *                     posts:
     *                       type: array
     *                       items:
     *                         type: object
     *       400:
     *         description: Bad request
     *       500:
     *         description: Server error
     */
    getUserAnalytics = async (req: Request, res: Response) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'userId is required as a query parameter'
                });
            }

            logger.info(`Fetching analytics for user ${userId}`);

            // Get total posts count
            const totalPosts = await prisma.post.count({
                where: {
                    userId: userId as string,
                    mediaType: { not: 'REPOST_FACADE' }
                }
            });

            // Calculate date for one week ago
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            // Fetch weekly posts with insights and analytics
            const weeklyPosts = await prisma.post.findMany({
                where: {
                    userId: userId as string,
                    timestamp: { gte: weekAgo },
                    mediaType: { not: 'REPOST_FACADE' }
                },
                include: {
                    insights: {
                        orderBy: { updatedAt: 'desc' },
                        take: 1
                    },
                    analytics: true
                },
                orderBy: { timestamp: 'desc' }
            });

            // Calculate weekly statistics
            const totalLikes = weeklyPosts.reduce((sum, p) =>
                sum + (p.insights[0]?.likes || 0), 0);

            const avgEngagement = weeklyPosts.length > 0
                ? weeklyPosts.reduce((sum, p) =>
                    sum + (p.analytics?.engagementRate || 0), 0) / weeklyPosts.length
                : 0;

            // Format response
            const response = {
                success: true,
                data: {
                    totalPosts,
                    weeklyStats: {
                        period: {
                            from: weekAgo.toISOString(),
                            to: new Date().toISOString()
                        },
                        totalPosts: weeklyPosts.length,
                        totalLikes,
                        averageEngagement: parseFloat(avgEngagement.toFixed(2))
                    },
                    posts: weeklyPosts.map(p => ({
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
                    }))
                }
            };

            logger.info(`Analytics retrieved: ${totalPosts} total posts, ${weeklyPosts.length} weekly posts`);
            res.json(response);
        } catch (error) {
            logger.error('Error in getUserAnalytics:', error);
            res.status(500).json({ success: false, error: 'Failed to retrieve analytics' });
        }
    };
}
