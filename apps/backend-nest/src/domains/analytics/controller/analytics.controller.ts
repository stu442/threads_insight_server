import { Body, Controller, Get, InternalServerErrorException, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../service/analytics.service';
import {
    AnalyzePostsReqDto,
    AnalyzePostsResDto,
    GetAnalyticsReqDto,
    GetAnalyticsResDto,
} from '../dto';

@ApiTags('Analytics')
@Controller()
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post('analyze')
    @ApiOperation({ summary: 'Analyze posts and calculate engagement metrics' })
    @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
    async analyzePosts(@Body() body: AnalyzePostsReqDto): Promise<AnalyzePostsResDto> {
        try {
            const result = await this.analyticsService.analyzePosts(body.userId, body.postIds);
            return {
                success: true,
                message: `Analyzed ${result.analyzedCount} posts`,
                analyzedCount: result.analyzedCount,
                skippedCount: result.skippedCount,
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to analyze posts' });
        }
    }

    @Get('analytics')
    @ApiOperation({ summary: 'Get user analytics and statistics' })
    @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
    async getUserAnalytics(@Query() query: GetAnalyticsReqDto): Promise<GetAnalyticsResDto> {
        try {
            const result = await this.analyticsService.getUserAnalytics(query.userId, query);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve analytics' });
        }
    }

    @Get('analytics/tags')
    @ApiOperation({ summary: 'Get tag correlation analytics' })
    @ApiResponse({ status: 200, description: 'Tag correlation analytics retrieved successfully' })
    async getTagCorrelation(@Query('userId') userId: string) {
        try {
            const result = await this.analyticsService.getTagCorrelation(userId);
            return { success: true, data: result };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve tag correlation' });
        }
    }

    @Get('analytics/categories')
    @ApiOperation({ summary: 'Get category performance analytics' })
    @ApiResponse({ status: 200, description: 'Category analytics retrieved successfully' })
    async getCategoryMetrics(@Query('userId') userId: string) {
        try {
            const result = await this.analyticsService.getCategoryMetrics(userId);
            return { success: true, data: result };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve category metrics' });
        }
    }

    @Get('analytics/time-of-day')
    @ApiOperation({ summary: 'Get time of day analytics' })
    @ApiResponse({ status: 200, description: 'Time of day analytics retrieved successfully' })
    async getTimeOfDayAnalytics(@Query('userId') userId: string) {
        try {
            const result = await this.analyticsService.getTimeOfDayAnalytics(userId);
            return { success: true, data: result };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve time of day analytics' });
        }
    }

    @Get('analytics/day-of-week')
    @ApiOperation({ summary: 'Get day of week analytics' })
    @ApiResponse({ status: 200, description: 'Day of week analytics retrieved successfully' })
    async getDayOfWeekAnalytics(@Query('userId') userId: string) {
        try {
            const result = await this.analyticsService.getDayOfWeekAnalytics(userId);
            return { success: true, data: result };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve day of week analytics' });
        }
    }
}
