import { BadRequestException, Body, Controller, Get, Logger, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThreadsAuthService, type LongLivedTokenResponse, type ShortLivedTokenResponse } from './threads-auth.service';
import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Threads Auth')
@Controller('threads/auth')
export class ThreadsAuthController {
    private readonly logger = new Logger(ThreadsAuthController.name);

    constructor(
        private readonly threadsAuthService: ThreadsAuthService,
        private readonly config: ConfigService,
    ) { }

    @Get('url')
    @ApiOperation({ summary: 'Generate Threads authorize URL with state' })
    @ApiResponse({ status: 200, description: 'Authorize URL generated' })
    getAuthorizeUrl(): { success: boolean; data: { url: string; state: string } } {
        const state = randomBytes(16).toString('hex');
        // TODO: Persist state to storage with TTL for validation on callback
        const url = this.threadsAuthService.buildAuthorizeUrl(state);
        return { success: true, data: { url, state } };
    }

    @Post('token')
    @ApiOperation({ summary: 'Exchange authorization code for a short-lived token (manual)' })
    @ApiResponse({ status: 200, description: 'Token issued successfully' })
    async exchangeToken(
        @Body('code') code?: string,
        @Body('state') state?: string,
        @Body('redirect_uri') redirectUri?: string,
    ) {
        if (!code) {
            throw new BadRequestException('code is required');
        }

        const token = await this.threadsAuthService.exchangeCodeForShortToken(code, redirectUri);
        return {
            success: true,
            data: {
                ...token,
                state,
            },
        };
    }

    @Post('token/long')
    @ApiOperation({ summary: 'Exchange short-lived token for a long-lived token' })
    @ApiResponse({ status: 200, description: 'Long-lived token issued successfully' })
    async exchangeLongToken(@Body('access_token') accessToken?: string): Promise<{
        success: boolean;
        data?: LongLivedTokenResponse;
    }> {
        if (!accessToken) {
            throw new BadRequestException('access_token is required');
        }

        const token = await this.threadsAuthService.exchangeShortToLongToken(accessToken);
        return {
            success: true,
            data: token,
        };
    }

    @Get('callback')
    @ApiOperation({ summary: 'Exchange authorization code for a short-lived token' })
    @ApiResponse({ status: 200, description: 'Token issued successfully' })
    async handleCallback(
        @Query('code') code?: string,
        @Query('state') state?: string,
        @Res() res?: Response,
    ): Promise<void | {
        success: boolean;
        data?: {
            shortLived: ShortLivedTokenResponse;
            longLived: LongLivedTokenResponse;
            state?: string;
            authToken: string;
        };
        error?: string;
    }> {
        if (!code) {
            throw new BadRequestException('code is required');
        }

        // TODO: Validate state against stored value to prevent CSRF
        if (state) {
            this.logger.log(`Received state: ${state}`);
        }

        try {
            const shortToken = await this.threadsAuthService.exchangeCodeForShortToken(code);
            const longToken = await this.threadsAuthService.exchangeShortToLongToken(shortToken.access_token);

            await this.threadsAuthService.upsertUserWithLongToken(
                shortToken.user_id.toString(),
                longToken.access_token,
                longToken.expires_in,
            );

            const authToken = this.threadsAuthService.generateAuthToken(shortToken.user_id.toString());

            // 성공 시 프론트 대시보드로 이동
            if (res) {
                this.threadsAuthService.setAuthCookie(res, authToken);
                const dashboardRedirect =
                    this.config.get<string>('THREADS_POST_AUTH_REDIRECT_URL') ??
                    'http://localhost:3000/dashboard';
                res.redirect(dashboardRedirect);
                return;
            }

            // (폴백) JSON 응답
            return {
                success: true,
                data: {
                    shortLived: shortToken,
                    longLived: longToken,
                    state,
                    authToken,
                },
            };
        } catch (error) {
            this.logger.error('Failed to handle Threads auth callback', error);
            if (res) {
                const loginRedirect =
                    this.config.get<string>('THREADS_POST_AUTH_ERROR_REDIRECT_URL') ??
                    'http://localhost:3000/login?error=threads_auth_failed';
                res.redirect(loginRedirect);
                return;
            }
            return {
                success: false,
                error: 'Failed to handle Threads auth callback',
            };
        }
    }

    @Get('me')
    @ApiOperation({ summary: '현재 인증된 Threads 사용자 정보 반환' })
    @ApiResponse({ status: 200, description: '유저 정보 반환' })
    getMe(@Req() req: Request) {
        const token = this.threadsAuthService.extractAuthToken(req);
        const { threadsUserId } = this.threadsAuthService.verifyAuthToken(token);

        if (!threadsUserId) {
            throw new UnauthorizedException('Invalid user');
        }

        return {
            success: true,
            data: {
                threadsUserId,
            },
        };
    }
}
