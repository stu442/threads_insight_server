import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac } from 'crypto';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export interface ShortLivedTokenResponse {
    access_token: string;
    user_id: string;
    token_type?: string;
    expires_in?: number;
}

export interface LongLivedTokenResponse {
    access_token: string;
    token_type?: string;
    expires_in?: number;
}

@Injectable()
export class ThreadsAuthService {
    private readonly logger = new Logger(ThreadsAuthService.name);
    private readonly oauthBase = 'https://graph.threads.net/oauth';
    private readonly graphBase = 'https://graph.threads.net';
    private readonly authorizeUrl = 'https://www.threads.net/oauth/authorize';
    private readonly jwtSecret: string;
    private readonly jwtExpiresInSeconds: number;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.jwtSecret = this.config.getOrThrow<string>('THREADS_AUTH_JWT_SECRET');
        this.jwtExpiresInSeconds = Number(this.config.get<string>('THREADS_AUTH_JWT_EXPIRES_IN') ?? 3600);
    }

    buildAuthorizeUrl(state: string) {
        const clientId = this.config.getOrThrow<string>('THREADS_CLIENT_ID');
        const redirectUri = this.config.getOrThrow<string>('THREADS_REDIRECT_URI');
        const scope = this.config.get<string>('THREADS_SCOPES') ?? 'threads_basic,threads_manage_insights';

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            response_type: 'code',
            state,
        });

        return `${this.authorizeUrl}?${params.toString()}`;
    }

    /**
     * Exchange authorization code for a short-lived access token.
     */
    async exchangeCodeForShortToken(code: string, overrideRedirectUri?: string): Promise<ShortLivedTokenResponse> {
        const clientId = this.config.getOrThrow<string>('THREADS_CLIENT_ID');
        const clientSecret = this.config.getOrThrow<string>('THREADS_CLIENT_SECRET');
        const redirectUri = overrideRedirectUri ?? this.config.getOrThrow<string>('THREADS_REDIRECT_URI');

        try {
            const response = await axios.post<ShortLivedTokenResponse>(`${this.oauthBase}/access_token`, null, {
                params: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code',
                    code,
                },
            });

            this.logger.log(`Received short-lived token for user ${response.data.user_id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const data = error.response?.data;
                this.logger.error(
                    `Failed to exchange code for short-lived token (status=${status}) response=${JSON.stringify(data)}`,
                );
            } else {
                this.logger.error('Failed to exchange code for short-lived token', error as Error);
            }
            throw error;
        }
    }

    /**
     * Exchange short-lived token for a long-lived token.
     */
    async exchangeShortToLongToken(shortLivedToken: string): Promise<LongLivedTokenResponse> {
        const clientSecret = this.config.getOrThrow<string>('THREADS_CLIENT_SECRET');

        try {
            const response = await axios.get<LongLivedTokenResponse>(`${this.graphBase}/access_token`, {
                params: {
                    grant_type: 'th_exchange_token',
                    client_secret: clientSecret,
                    access_token: shortLivedToken,
                },
            });

            this.logger.log('Exchanged short-lived token for long-lived token');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const data = error.response?.data;
                this.logger.error(
                    `Failed to exchange short-lived token for long-lived token (status=${status}) response=${JSON.stringify(data)}`,
                );
            } else {
                this.logger.error('Failed to exchange short-lived token for long-lived token', error as Error);
            }
            throw error;
        }
    }

    /**
     * Upsert Threads user with long-lived token.
     */
    async upsertUserWithLongToken(threadsUserId: string, longLivedToken: string, expiresInSeconds?: number) {
        const expiresAt = expiresInSeconds ? new Date(Date.now() + expiresInSeconds * 1000) : null;

        await this.prisma.user.upsert({
            where: { threadsUserId },
            update: {
                threadsLongLivedToken: longLivedToken,
                threadsTokenExpiresAt: expiresAt ?? undefined,
            },
            create: {
                threadsUserId,
                threadsLongLivedToken: longLivedToken,
                threadsTokenExpiresAt: expiresAt ?? undefined,
            },
        });

        this.logger.log(`Stored long-lived token for Threads user ${threadsUserId}`);
    }

    /**
     * Issue a short-lived JWT for identifying the logged-in Threads user.
     * The token contains only the sub (threadsUserId), iat, exp.
     */
    generateAuthToken(threadsUserId: string): string {
        const header = { alg: 'HS256', typ: 'JWT' };
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiresAt = issuedAt + this.jwtExpiresInSeconds;
        const payload = { sub: threadsUserId, iat: issuedAt, exp: expiresAt };

        const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
        const unsigned = `${encode(header)}.${encode(payload)}`;
        const signature = createHmac('sha256', this.jwtSecret).update(unsigned).digest('base64url');

        return `${unsigned}.${signature}`;
    }

    verifyAuthToken(token?: string): { threadsUserId: string } {
        if (!token) {
            throw new UnauthorizedException('Missing auth token');
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new UnauthorizedException('Invalid token');
        }

        const [headerB64, payloadB64, signature] = parts;
        const unsigned = `${headerB64}.${payloadB64}`;
        const expected = createHmac('sha256', this.jwtSecret).update(unsigned).digest('base64url');
        if (expected !== signature) {
            throw new UnauthorizedException('Invalid signature');
        }

        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
        if (!payload?.sub) {
            throw new UnauthorizedException('Invalid payload');
        }

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && now >= payload.exp) {
            throw new UnauthorizedException('Token expired');
        }

        return { threadsUserId: payload.sub };
    }

    extractAuthToken(req: Request): string | undefined {
        const bearer = req.headers.authorization;
        if (bearer?.startsWith('Bearer ')) {
            return bearer.slice('Bearer '.length);
        }

        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) return undefined;

        const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
            const [key, ...rest] = part.trim().split('=');
            if (key && rest.length) {
                acc[key] = rest.join('=');
            }
            return acc;
        }, {});

        return cookies['threads_auth'];
    }

    setAuthCookie(res: Response, token: string) {
        const configuredSameSite = (this.config.get<string>('THREADS_AUTH_COOKIE_SAMESITE') ?? '').toLowerCase();
        const sameSite: boolean | 'lax' | 'strict' | 'none' =
            configuredSameSite === 'none' ? 'none' : configuredSameSite === 'strict' ? 'strict' : 'lax';
        const domain = this.config.get<string>('THREADS_AUTH_COOKIE_DOMAIN') || undefined;
        const secureCookies = (this.config.get<string>('NODE_ENV') ?? 'development') === 'production' || sameSite === 'none';

        res.cookie('threads_auth', token, {
            httpOnly: true,
            sameSite,
            secure: secureCookies,
            path: '/',
            domain,
            maxAge: this.jwtExpiresInSeconds * 1000,
        });
    }
}
