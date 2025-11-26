import { Module } from '@nestjs/common';
import { InsightController } from './insights.controller';
import { InsightService } from './insight.service';
import { AnalyticsService } from './analytics.service';
import { ThreadsModule } from '../threads/threads.module';

import { OpenAIService } from './openai.service';
import { PostLabelingService } from './post-labeling.service';

@Module({
    imports: [ThreadsModule],
    controllers: [InsightController],
    providers: [InsightService, AnalyticsService, PostLabelingService, OpenAIService],
})
export class InsightsModule { }
