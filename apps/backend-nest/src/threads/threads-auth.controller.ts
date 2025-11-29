import { BadRequestException, Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThreadsAuthService } from './threads-auth.service';
import { randomBytes } from 'crypto';

@ApiTags('Threads Auth')
@Controller('threads/auth')
export class ThreadsAuthController {
    private readonly logger = new Logger(ThreadsAuthController.name);

    constructor(private readonly threadsAuthService: ThreadsAuthService) { }

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
    async exchangeLongToken(@Body('access_token') accessToken?: string) {
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
    ): Promise<{
        success: boolean;
        data?: {
            shortLived: {
                access_token: string;
                user_id: string;
                token_type?: string;
                expires_in?: number;
            };
            longLived: {
                access_token: string;
                token_type?: string;
                expires_in?: number;
            };
            state?: string;
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

            return {
                success: true,
                data: {
                    shortLived: shortToken,
                    longLived: longToken,
                    state,
                },
            };
        } catch (error) {
            this.logger.error('Failed to handle Threads auth callback', error);
            return {
                success: false,
                error: 'Failed to handle Threads auth callback',
            };
        }
    }
}
