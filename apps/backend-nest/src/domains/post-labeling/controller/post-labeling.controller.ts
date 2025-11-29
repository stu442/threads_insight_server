import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostLabelingService } from '../service/post-labeling.service';
import { LabelPostsReqDto, LabelPostsResDto } from '../dto';

@ApiTags('Analytics')
@Controller()
export class PostLabelingController {
    constructor(private readonly postLabelingService: PostLabelingService) { }

    @Post('analytics/label')
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
                failures: result.failures,
            };
        } catch (error) {
            throw new InternalServerErrorException({ success: false, error: 'Failed to label posts' });
        }
    }
}
