import { ApiProperty } from '@nestjs/swagger';

export class InsightDto {
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
    updatedAt?: string | Date;
}

export class PostWithInsightsDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string | null;

    @ApiProperty()
    caption: string | null;

    @ApiProperty()
    permalink: string;

    @ApiProperty()
    mediaType: string | null;

    @ApiProperty()
    username: string | null;

    @ApiProperty()
    timestamp: string | Date;

    @ApiProperty({ type: [InsightDto] })
    insights: InsightDto[];
}
