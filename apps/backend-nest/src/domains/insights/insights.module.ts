import { Module } from '@nestjs/common';
import { InsightController } from './controller/insights.controller';
import { InsightService } from './service/insights.service';
import { ThreadsModule } from '../../threads/threads.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { InsightSyncService } from './service/insights-sync.service';

@Module({
    imports: [ThreadsModule, AnalyticsModule],
    controllers: [InsightController],
    providers: [InsightService, InsightSyncService],
})
export class InsightsModule { }
