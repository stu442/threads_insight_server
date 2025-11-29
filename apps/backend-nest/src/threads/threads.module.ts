import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { ThreadsAuthService } from './threads-auth.service';
import { ThreadsAuthController } from './threads-auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ThreadsService, ThreadsAuthService],
    controllers: [ThreadsController, ThreadsAuthController],
    exports: [ThreadsService, ThreadsAuthService],
})
export class ThreadsModule { }
