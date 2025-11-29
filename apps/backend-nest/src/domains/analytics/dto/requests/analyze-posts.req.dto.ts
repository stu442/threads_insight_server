import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzePostsReqDto {
    @ApiProperty({ description: 'Threads user ID' })
    @IsString()
    userId: string;

    @ApiPropertyOptional({ description: 'Optional array of specific post IDs to analyze' })
    @IsOptional()
    @IsString({ each: true })
    postIds?: string[];
}
