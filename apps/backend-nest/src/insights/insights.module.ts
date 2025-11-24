import { Module } from '@nestjs/common';
import { InsightController } from './insights.controller';
import { InsightService } from './insight.service';
import { AnalyticsService } from './analytics.service';
import { ThreadsModule } from '../threads/threads.module';

@Module({
    imports: [ThreadsModule],
    controllers: [InsightController],
    providers: [InsightService, AnalyticsService],
})
export class InsightsModule { }
