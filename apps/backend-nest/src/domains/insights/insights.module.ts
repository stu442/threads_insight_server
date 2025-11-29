import { Module } from '@nestjs/common';
import { InsightController } from './controller/insights.controller';
import { InsightService } from './service/insights.service';
import { ThreadsModule } from '../../threads/threads.module';

@Module({
    imports: [ThreadsModule],
    controllers: [InsightController],
    providers: [InsightService],
})
export class InsightsModule { }
