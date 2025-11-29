import { ApiProperty } from '@nestjs/swagger';

export class AnalyzePostsResDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'Analyzed 5 posts' })
    message: string;

    @ApiProperty()
    analyzedCount: number;

    @ApiProperty()
    skippedCount: number;
}
