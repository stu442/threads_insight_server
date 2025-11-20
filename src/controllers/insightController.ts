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

            logger.info(`Starting insight collection with limit: ${limit}`);

            const threadsService = new ThreadsService(token, userId);
            const posts = await threadsService.getMedia(limit);

            let savedCount = 0;

            for (const post of posts) {
                // Save or update post
                await prisma.post.upsert({
                    where: { id: post.id },
                    update: {
                        caption: post.text || '',
                        permalink: post.permalink,
                        mediaType: post.media_type,
                        username: post.username,
                        timestamp: new Date(post.timestamp),
                    },
                    create: {
                        id: post.id,
                        caption: post.text || '',
                        permalink: post.permalink,
                        mediaType: post.media_type,
                        username: post.username,
                        timestamp: new Date(post.timestamp),
                    },
                });

                const insightsData = await threadsService.getInsights(post.id);

                if (insightsData && insightsData.length > 0) {
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
                }
            }

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
     *     summary: Retrieve all posts with their latest insights
     *     tags: [Insights]
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
            const insights = await prisma.post.findMany({
                include: {
                    insights: {
                        orderBy: { timestamp: 'desc' },
                        take: 1 // Get latest insight
                    }
                },
                orderBy: { timestamp: 'desc' }
            });
            res.json(insights);
        } catch (error) {
            logger.error('Error in getInsights:', error);
            res.status(500).json({ success: false, error: 'Failed to retrieve insights' });
        }
    };
}
