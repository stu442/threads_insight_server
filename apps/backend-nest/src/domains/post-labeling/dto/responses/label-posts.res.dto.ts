import { ApiProperty } from '@nestjs/swagger';

export class LabelPostsResDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'Labeled 5 posts' })
    message: string;

    @ApiProperty()
    labeledCount: number;

    @ApiProperty()
    skippedCount: number;

    @ApiProperty()
    failedCount: number;

    @ApiProperty({ type: [Object], description: 'List of posts that failed labeling with reasons' })
    failures: { postId: string; reason: string }[];
}
