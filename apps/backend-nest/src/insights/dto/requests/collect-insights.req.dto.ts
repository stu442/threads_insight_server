import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CollectInsightsReqDto {
    @ApiProperty({ description: 'Threads API access token' })
    @IsString()
    token: string;

    @ApiProperty({ description: 'Threads user ID' })
    @IsString()
    userId: string;

    @ApiPropertyOptional({ description: 'Number of posts to fetch', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
