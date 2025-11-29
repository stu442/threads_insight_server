import { Controller, Get, Query, BadRequestException, InternalServerErrorException, Param, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InsightService } from '../service/insights.service';
import { CollectInsightsResDto, GetInsightsReqDto, PostWithInsightsDto } from '../dto';

@ApiTags('Insights')
@Controller()
export class InsightController {
    constructor(private readonly insightService: InsightService) { }

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
    async collectInsights(@Query('limit') limit: number = 100): Promise<CollectInsightsResDto> {
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
            return { success: true, data: post };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException({ success: false, error: 'Failed to retrieve post' });
        }
    }
}
