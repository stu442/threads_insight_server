import { Controller, Post, Get, Body, Query, InternalServerErrorException, BadRequestException, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InsightService } from './insight.service';
import { AnalyticsService } from './analytics.service';
import {
    CollectInsightsReqDto,
    GetInsightsReqDto,
    AnalyzePostsReqDto,
    GetAnalyticsReqDto,
    CollectInsightsResDto,
    AnalyzePostsResDto,
    PostWithInsightsDto,
    GetAnalyticsResDto
} from './dto';

@ApiTags('Insights')
@Controller()
export class InsightController {
    constructor(
        private readonly insightService: InsightService,
        private readonly analyticsService: AnalyticsService,
    ) { }

    @Post('collect')
    @ApiOperation({ summary: 'Collect insights from Threads posts' })
    @ApiResponse({ status: 200, description: 'Successfully collected insights' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async collectInsights(@Body() body: CollectInsightsReqDto): Promise<CollectInsightsResDto> {
        try {
            const result = await this.insightService.collectInsights(body.token, body.userId, body.limit);
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
}
