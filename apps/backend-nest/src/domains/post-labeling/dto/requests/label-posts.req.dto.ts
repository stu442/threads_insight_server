import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LabelPostsReqDto {
    @ApiProperty({ description: 'Threads user ID' })
    @IsString()
    userId: string;

    @ApiPropertyOptional({ description: 'Optional array of specific post IDs to label with GPT' })
    @IsOptional()
    @IsString({ each: true })
    postIds?: string[];

    @ApiPropertyOptional({ description: 'Force re-label even if analytics already exist', default: false })
    @IsOptional()
    @IsBoolean()
    force?: boolean;
}
