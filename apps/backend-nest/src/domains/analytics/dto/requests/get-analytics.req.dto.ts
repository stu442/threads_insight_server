import { IsString, IsOptional, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SortBy, SortOrder } from '../common/analytics-sorting.enum';

export class GetAnalyticsReqDto {
    @ApiProperty({ description: 'Threads user ID' })
    @IsString()
    userId: string;

    @ApiPropertyOptional({ description: 'Start date for filtering posts (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date for filtering posts (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ enum: SortBy, default: SortBy.DATE, description: 'Field to sort by' })
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.DATE;

    @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC, description: 'Sort order' })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of posts per page', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10;
}
