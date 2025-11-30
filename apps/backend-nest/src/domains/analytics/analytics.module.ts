import { Module } from '@nestjs/common';
import { AnalyticsController } from './controller/analytics.controller';
import { AnalyticsService } from './service/analytics.service';

@Module({
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
