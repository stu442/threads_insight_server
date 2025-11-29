import { ApiProperty } from '@nestjs/swagger';

export class SyncInsightsResDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'full', enum: ['full', 'incremental'] })
    mode: 'full' | 'incremental';

    @ApiProperty({ example: 120 })
    collectedCount: number;

    @ApiProperty({ example: 120 })
    analyzedCount: number;

    @ApiProperty({ example: 5 })
    skippedCount: number;

    @ApiProperty({ type: [String] })
    touchedPostIds: string[];
}
