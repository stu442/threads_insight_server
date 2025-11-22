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

                    await prisma.insight.create({
                        data: {
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
                        orderBy: { timestamp: 'desc' },
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
}
