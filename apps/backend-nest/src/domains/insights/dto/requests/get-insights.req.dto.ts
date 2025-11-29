import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetInsightsReqDto {
    @ApiProperty({ description: 'Threads user ID to filter posts' })
    @IsString()
    userId: string;

    @ApiPropertyOptional({ description: 'Number of posts to retrieve', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
