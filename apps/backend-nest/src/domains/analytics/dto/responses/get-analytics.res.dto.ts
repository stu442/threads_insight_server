import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsMetricsDto {
    @ApiProperty()
    views: number;

    @ApiProperty()
    likes: number;

    @ApiProperty()
    replies: number;

    @ApiProperty()
    reposts: number;

    @ApiProperty()
    quotes: number;

    @ApiProperty()
    engagement: number;
}

export class AnalyticsPostDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    caption: string;

    @ApiProperty()
    permalink: string;

    @ApiProperty()
    timestamp: string;

    @ApiProperty({ type: AnalyticsMetricsDto })
    metrics: AnalyticsMetricsDto;
}

export class AnalyticsPeriodDto {
    @ApiProperty()
    from: string | null;

    @ApiProperty()
    to: string | null;
}

export class AnalyticsPeriodStatsDto {
    @ApiProperty({ type: AnalyticsPeriodDto })
    period: AnalyticsPeriodDto;

    @ApiProperty()
    postCount: number;

    @ApiProperty()
    totalLikes: number;

    @ApiProperty()
    averageEngagement: number;
}

export class AnalyticsPaginationDto {
    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    total: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    hasNext: boolean;

    @ApiProperty()
    hasPrev: boolean;
}

export class AnalyticsDataDto {
    @ApiProperty()
    totalPosts: number;

    @ApiProperty({ type: AnalyticsPeriodStatsDto })
    periodStats: AnalyticsPeriodStatsDto;

    @ApiProperty({ type: AnalyticsPaginationDto })
    pagination: AnalyticsPaginationDto;

    @ApiProperty({ type: [AnalyticsPostDto] })
    posts: AnalyticsPostDto[];
}

export class GetAnalyticsResDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: AnalyticsDataDto })
    data: AnalyticsDataDto;
}
