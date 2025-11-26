import { Controller, Post, Get, Body, Query, InternalServerErrorException, BadRequestException, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InsightService } from './insight.service';
import { AnalyticsService } from './analytics.service';
import { PostLabelingService } from './post-labeling.service';
import {
    CollectInsightsReqDto,
    GetInsightsReqDto,
    AnalyzePostsReqDto,
    GetAnalyticsReqDto,
    CollectInsightsResDto,
    AnalyzePostsResDto,
    PostWithInsightsDto,
    GetAnalyticsResDto,
    LabelPostsReqDto,
    LabelPostsResDto
} from './dto';

@ApiTags('Insights')
@Controller()
export class InsightController {
    constructor(
        private readonly insightService: InsightService,
        private readonly analyticsService: AnalyticsService,
        private readonly postLabelingService: PostLabelingService,
    ) { }

    @Get('collect/full')
    @ApiOperation({ summary: 'Collect insights from all Threads posts (full sync)' })
    @ApiResponse({ status: 200, description: 'Successfully collected all insights' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async collectAllInsights(): Promise<CollectInsightsResDto> {
        try {
            const token = process.env.THREADS_ACCESS_TOKEN;
            const userId = process.env.THREADS_USER_ID;

            if (!token || !userId) {
                throw new BadRequestException('Missing required environment variables');
            }

            const result = await this.insightService.collectAllInsights(token, userId);
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
        @Query('limit') limit: number = 100
    ): Promise<CollectInsightsResDto> {
        try {
            const token = process.env.THREADS_ACCESS_TOKEN;
            const userId = process.env.THREADS_USER_ID;

            if (!token || !userId) {
                throw new BadRequestException('Missing required environment variables');
            }

            const result = await this.insightService.collectInsights(token, userId, Number(limit));
            return { success: true, message: `Collected insights for ${result.savedCount} posts` };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to collect insights' });
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
            return {
                success: true,
                data: post
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve post' });
        }
    }

    @Post('analyze')
    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Analyze posts and calculate engagement metrics' })
    @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
    async analyzePosts(@Body() body: AnalyzePostsReqDto): Promise<AnalyzePostsResDto> {
        try {
            const result = await this.analyticsService.analyzePosts(body.userId, body.postIds);
            return {
                success: true,
                message: `Analyzed ${result.analyzedCount} posts`,
                analyzedCount: result.analyzedCount,
                skippedCount: result.skippedCount
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to analyze posts' });
        }
    }

    @Get('analytics')
    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Get user analytics and statistics' })
    @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
    async getUserAnalytics(@Query() query: GetAnalyticsReqDto): Promise<GetAnalyticsResDto> {
        try {
            const result = await this.analyticsService.getUserAnalytics(query.userId, query);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve analytics' });
        }
    }

    @Post('analytics/label')
    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Generate GPT-based category/tags for posts' })
    @ApiResponse({ status: 200, description: 'Labeling completed successfully' })
    async labelPosts(@Body() body: LabelPostsReqDto): Promise<LabelPostsResDto> {
        try {
            const result = await this.postLabelingService.labelPosts(body.userId, body.postIds, body.force ?? false);
            return {
                success: true,
                message: `Labeled ${result.labeledCount} posts`,
                labeledCount: result.labeledCount,
                skippedCount: result.skippedCount,
                failedCount: result.failedCount,
                failures: result.failures
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to label posts' });
        }
    }
    @Get('analytics/tags')
    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Get tag correlation analytics' })
    @ApiResponse({ status: 200, description: 'Tag correlation analytics retrieved successfully' })
    async getTagCorrelation(@Query('userId') userId: string) {
        try {
            const result = await this.analyticsService.getTagCorrelation(userId);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve tag correlation' });
        }
    }

    @Get('analytics/categories')
    @ApiTags('Analytics')
    @ApiOperation({ summary: 'Get category performance analytics' })
    @ApiResponse({ status: 200, description: 'Category analytics retrieved successfully' })
    async getCategoryMetrics(@Query('userId') userId: string) {
        try {
            const result = await this.analyticsService.getCategoryMetrics(userId);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve category metrics' });
        }
    }
}
