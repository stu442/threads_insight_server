import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThreadsUserService {
    private readonly logger = new Logger(ThreadsUserService.name);

    constructor(private readonly prisma: PrismaService) { }

    async resolveUserToken(threadsUserId?: string): Promise<{ userId: string; token: string }> {
        if (!threadsUserId) {
            this.logger.warn('Missing threadsUserId on request (auth may be misconfigured)');
            throw new UnauthorizedException('Missing Threads user id');
        }

        this.logger.debug(`Fetching token for threadsUserId=${threadsUserId}`);
        const user = await this.prisma.user.findUnique({
            where: { threadsUserId },
        });

        if (!user?.threadsLongLivedToken) {
            this.logger.warn(`Threads token not found for userId=${threadsUserId} (user ${user ? 'found' : 'not found'})`);
            throw new UnauthorizedException('Threads token not found for user');
        }

        this.logger.debug(`Threads token resolved for userId=${threadsUserId}`);
        return { token: user.threadsLongLivedToken, userId: threadsUserId };
    }
}
