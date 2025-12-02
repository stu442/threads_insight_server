import {
    Controller,
    Get,
    Query,
    InternalServerErrorException,
    Param,
    NotFoundException,
    Req,
    Post,
    Logger,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { InsightService } from '../service/insights.service';
import { CollectInsightsResDto, GetInsightsReqDto, PostWithInsightsDto, SyncInsightsResDto } from '../dto';
import { InsightSyncService } from '../service/insights-sync.service';
import { ThreadsUserService } from '../../../threads/threads-user.service';

interface ThreadsRequest extends Request {
    threadsUserId?: string;
}

@ApiTags('Insights')
@Controller()
export class InsightController {
    private readonly logger = new Logger(InsightController.name);

    constructor(
        private readonly insightService: InsightService,
        private readonly insightSyncService: InsightSyncService,
        private readonly threadsUserService: ThreadsUserService,
    ) { }

    @Get('collect/full')
    @ApiOperation({ summary: 'Collect insights from all Threads posts (full sync)' })
    @ApiResponse({ status: 200, description: 'Successfully collected all insights' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async collectAllInsights(@Req() req: ThreadsRequest): Promise<CollectInsightsResDto> {
        try {
            const { userId, token } = await this.threadsUserService.resolveUserToken(req.threadsUserId);
            const result = await this.insightService.collectInsights(token, userId, { mode: 'full' });
            return { success: true, message: `Collected insights for ${result.savedCount} posts (full sync)` };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to collect all insights' });
        }
    }

    @Get('collect')
    @ApiOperation({ summary: 'Collect insights from recent Threads posts' })
    @ApiResponse({ status: 200, description: 'Successfully collected insights' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async collectInsights(
        @Query('limit') limit: number = 100,
        @Query('userId') userIdFromQuery?: string,
        @Req() req?: ThreadsRequest,
    ): Promise<CollectInsightsResDto> {
        try {
            const { userId, token } = await this.threadsUserService.resolveUserToken(userIdFromQuery ?? req?.threadsUserId);
            const parsedLimit = Number(limit) || 100;
            const result = await this.insightService.collectInsights(token, userId, { mode: 'recent', limit: parsedLimit });
            return { success: true, message: `Collected insights for ${result.savedCount} posts` };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to collect insights' });
        }
    }

    @Post('sync')
    @ApiOperation({ summary: 'Ensure user data is collected and analyzed before serving dashboard' })
    @ApiResponse({ status: 200, description: 'Sync completed successfully' })
    async syncUserData(@Req() req: ThreadsRequest): Promise<SyncInsightsResDto> {
        try {
            const { userId, token } = await this.threadsUserService.resolveUserToken(req.threadsUserId);

            // 대시보드 진입 시: UI는 바로 응답, 인크리멘탈(최근 100개)은 백그라운드로 돌린다
            const result = await this.insightSyncService.syncUserData(token, userId, { allowIncremental: false });

            let backgroundSyncStarted = false;
            if (result.mode === 'skipped') {
                backgroundSyncStarted = true;
                void this.insightSyncService
                    .syncUserData(token, userId, { allowIncremental: true })
                    .then((bgResult) => {
                        this.logger.log(
                            `Background incremental sync completed for user ${userId} (collected=${bgResult.collectedCount}, analyzed=${bgResult.analyzedCount}, skipped=${bgResult.skippedCount})`,
                        );
                    })
                    .catch((err) => {
                        this.logger.error(`Background incremental sync failed for user ${userId}`, err);
                    });
            }
            return {
                success: true,
                mode: result.mode,
                collectedCount: result.collectedCount,
                analyzedCount: result.analyzedCount,
                skippedCount: result.skippedCount,
                touchedPostIds: result.touchedPostIds,
                backgroundSyncStarted,
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to sync user data' });
        }
    }

    @Get('insights')
    @ApiOperation({ summary: 'Retrieve posts with their latest insights for a specific user' })
    @ApiResponse({ status: 200, description: 'List of posts with insights' })
    async getInsights(@Query() query: GetInsightsReqDto): Promise<PostWithInsightsDto[]> {
        try {
            return await this.insightService.getInsights(query.userId, query.limit);
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve insights' });
        }
    }

    @Get('posts/:id')
    @ApiOperation({ summary: 'Retrieve a single post with insights and analytics' })
    @ApiResponse({ status: 200, description: 'Post details retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async getPost(@Param('id') id: string) {
        try {
            const post = await this.insightService.getPost(id);
            if (!post) {
                throw new NotFoundException({ success: false, error: 'Post not found' });
            }
            return { success: true, data: post };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve post' });
        }
    }
}
