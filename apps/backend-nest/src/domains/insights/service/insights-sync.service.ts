import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InsightService } from './insights.service';
import { AnalyticsService } from '../../analytics/service/analytics.service';

type SyncMode = 'full' | 'incremental' | 'skipped';

@Injectable()
export class InsightSyncService {
    private readonly logger = new Logger(InsightSyncService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly insightService: InsightService,
        private readonly analyticsService: AnalyticsService,
    ) { }

    async syncUserData(
        token: string,
        userId: string,
        options?: { allowIncremental?: boolean },
    ): Promise<{
        mode: SyncMode;
        collectedCount: number;
        analyzedCount: number;
        skippedCount: number;
        touchedPostIds: string[];
    }> {
        const allowIncremental = options?.allowIncremental ?? true;
        this.logger.debug(`Sync requested for userId=${userId}`);
        const existingPosts = await this.prisma.post.count({
            where: {
                userId,
                mediaType: { not: 'REPOST_FACADE' },
            },
        });

        const mode: SyncMode = existingPosts === 0 ? 'full' : allowIncremental ? 'incremental' : 'skipped';
        this.logger.log(
            `Running ${mode} sync for user ${userId} (existingPosts=${existingPosts}, allowIncremental=${allowIncremental})`,
        );

        if (mode === 'skipped') {
            return {
                mode,
                collectedCount: 0,
                analyzedCount: 0,
                skippedCount: 0,
                touchedPostIds: [],
            };
        }

        const collectResult = mode === 'full'
            ? await this.insightService.collectAllInsights(token, userId)
            : await this.insightService.collectInsights(token, userId, { limit: 100, recentDays: 7 });
        this.logger.debug(
            `Collect result for user ${userId}: saved=${collectResult.savedCount}, touched=${collectResult.postIds.length}, created=${collectResult.createdPostIds.length}`,
        );

        try {
            const analyzeResult = await this.prisma.$transaction((tx) =>
                this.analyticsService.analyzePosts(
                    userId,
                    collectResult.postIds.length > 0 ? collectResult.postIds : undefined,
                    tx,
                ),
            );

            return {
                mode,
                collectedCount: collectResult.savedCount,
                analyzedCount: analyzeResult.analyzedCount,
                skippedCount: analyzeResult.skippedCount,
                touchedPostIds: collectResult.postIds,
            };
        } catch (error) {
            // If analysis fails, clean up brand-new posts to avoid partial state
            if (collectResult.createdPostIds?.length) {
                await this.prisma.$transaction([
                    this.prisma.postAnalytics.deleteMany({ where: { postId: { in: collectResult.createdPostIds } } }),
                    this.prisma.insight.deleteMany({ where: { postId: { in: collectResult.createdPostIds } } }),
                    this.prisma.post.deleteMany({ where: { id: { in: collectResult.createdPostIds } } }),
                ]);
                this.logger.warn(
                    `Analysis failed; cleaned up ${collectResult.createdPostIds.length} newly created posts for user ${userId}`,
                );
            }

            throw error;
        }
    }
}
