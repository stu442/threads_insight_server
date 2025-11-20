import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ThreadsService } from '../services/threads';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class InsightController {
    private threadsService: ThreadsService;

    constructor() {
        const token = process.env.THREADS_ACCESS_TOKEN || '';
        const userId = process.env.THREADS_USER_ID || '';
        this.threadsService = new ThreadsService(token, userId);
    }

    collectInsights = async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || parseInt(req.body.limit) || 10;
            logger.info(`Starting insight collection with limit: ${limit}`);
            const posts = await this.threadsService.getMedia(limit);

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

                // Fetch insights
                const insightsData = await this.threadsService.getInsights(post.id);

                if (insightsData && insightsData.length > 0) {
                    // Transform insights array to object
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
