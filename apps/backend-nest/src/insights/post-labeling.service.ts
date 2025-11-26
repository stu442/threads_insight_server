import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from './openai.service';

@Injectable()
export class PostLabelingService {
    private readonly logger = new Logger(PostLabelingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly openaiService: OpenAIService
    ) { }

    async labelPosts(
        userId: string,
        postIds?: string[],
        force: boolean = false
    ): Promise<{
        labeledCount: number;
        skippedCount: number;
        failedCount: number;
        failures: { postId: string; reason: string }[];
    }> {
        this.logger.log(
            `Starting labeling for user ${userId} (postIds=${postIds ? postIds.length : 'all'}, force=${force})`
        );
        const posts = await this.prisma.post.findMany({
            where: {
                userId,
                id: postIds ? { in: postIds } : undefined,
                mediaType: { not: 'REPOST_FACADE' }
            },
            include: { analytics: true }
        });

        let labeledCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        const failures: { postId: string; reason: string }[] = [];

        for (const post of posts) {
            if (!post.caption || post.caption.trim().length === 0) {
                this.logger.debug(`Skipping post ${post.id}: empty caption`);
                skippedCount++;
                continue;
            }

            if (!force && post.analytics && post.analytics.category) {
                this.logger.debug(`Skipping post ${post.id}: category already exist`);
                skippedCount++;
                continue;
            }

            try {
                const gptInsights = await this.openaiService.generateInsights(post.caption);

                if (!gptInsights.category && (!gptInsights.tags || gptInsights.tags.length === 0)) {
                    this.logger.warn(`Skipping post ${post.id}: no insights`);
                    skippedCount++;
                    continue;
                }

                // Merge with existing tags (e.g. len-100, len-200)
                const existingTags = post.analytics?.tags || [];
                const newTags = gptInsights.tags || [];
                const mergedTags = Array.from(new Set([...existingTags, ...newTags]));

                await this.prisma.postAnalytics.upsert({
                    where: { postId: post.id },
                    update: {
                        category: gptInsights.category,
                        tags: mergedTags
                    },
                    create: {
                        postId: post.id,
                        category: gptInsights.category,
                        tags: mergedTags
                    }
                });

                this.logger.log(`Labeled post ${post.id} (category=${gptInsights.category ?? 'null'}, tags=${gptInsights.tags?.join(',') ?? '[]'})`);
                labeledCount++;
            } catch (error) {
                failedCount++;
                failures.push({ postId: post.id, reason: error.message });
                this.logger.error(`Failed to label post ${post.id}: ${error.message}`);
            }
        }

        this.logger.log(
            `Labeling completed for user ${userId} (labeled=${labeledCount}, skipped=${skippedCount}, failed=${failedCount})`
        );
        return { labeledCount, skippedCount, failedCount, failures };
    }
}
