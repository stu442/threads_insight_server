import { ApiProperty } from '@nestjs/swagger';

export class SyncInsightsResDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'full', enum: ['full', 'incremental', 'skipped'] })
    mode: 'full' | 'incremental' | 'skipped';

    @ApiProperty({ example: 120 })
    collectedCount: number;

    @ApiProperty({ example: 120 })
    analyzedCount: number;

    @ApiProperty({ example: 5 })
    skippedCount: number;

    @ApiProperty({ type: [String] })
    touchedPostIds: string[];

    @ApiProperty({
        description: 'Indicates an incremental sync was queued in the background (non-blocking) when existing posts already exist.',
        example: true,
    })
    backgroundSyncStarted: boolean;
}
