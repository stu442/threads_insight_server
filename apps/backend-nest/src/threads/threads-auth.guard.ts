import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThreadsAuthService } from './threads-auth.service';

@Injectable()
export class ThreadsAuthGuard implements CanActivate {
    constructor(
        private readonly threadsAuthService: ThreadsAuthService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const path: string = request.path ?? '';

        // 로컬 우회용: THREADS_AUTH_DISABLE=true 이면 인증 건너뜀
        if (process.env.THREADS_AUTH_DISABLE === 'true') {
            request.threadsUserId = process.env.THREADS_DEV_USER_ID ?? 'dev-user';
            return true;
        }

        // Whitelist: ping, auth handshake, docs
        const whitelisted = [
            '/ping',
            '/threads/auth/url',
            '/threads/auth/callback',
            '/threads/auth/token',
            '/threads/auth/token/long',
            '/api-docs',
        ];
        if (whitelisted.some((p) => path === p || path.startsWith(`${p}/`))) {
            return true;
        }

        const token = this.threadsAuthService.extractAuthToken(request);
        const { threadsUserId } = this.threadsAuthService.verifyAuthToken(token);
        if (!threadsUserId) {
            throw new UnauthorizedException('Invalid user');
        }

        request.threadsUserId = threadsUserId;
        return true;
    }
}
