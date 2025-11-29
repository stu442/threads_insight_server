import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThreadsModule } from './threads/threads.module';
import { InsightsModule } from './insights/insights.module';

import { AppController } from './app.controller';
import { ThreadsAuthGuard } from './threads/threads-auth.guard';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        ThreadsModule,
        InsightsModule,
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
