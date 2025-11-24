import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThreadsModule } from './threads/threads.module';
import { InsightsModule } from './insights/insights.module';

import { AppController } from './app.controller';

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
})
export class AppModule { }
