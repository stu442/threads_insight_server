import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThreadsModule } from './threads/threads.module';
import { AnalyticsModule } from './domains/analytics/analytics.module';
import { InsightsModule } from './domains/insights/insights.module';
import { OpenAIModule } from './domains/openai/openai.module';
import { PostLabelingModule } from './domains/post-labeling/post-labeling.module';

import { AppController } from './app.controller';
import { ThreadsAuthGuard } from './threads/threads-auth.guard';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        ThreadsModule,
        AnalyticsModule,
        InsightsModule,
        OpenAIModule,
        PostLabelingModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThreadsAuthGuard,
        },
    ],
})
export class AppModule { }
