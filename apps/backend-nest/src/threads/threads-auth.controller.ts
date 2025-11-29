import { BadRequestException, Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThreadsAuthService } from './threads-auth.service';
import { randomBytes } from 'crypto';
import { Body, Post } from '@nestjs/common';

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

    @Get('callback')
    @ApiOperation({ summary: 'Exchange authorization code for a short-lived token' })
    @ApiResponse({ status: 200, description: 'Token issued successfully' })
    async handleCallback(
        @Query('code') code?: string,
        @Query('state') state?: string,
    ): Promise<{
        success: boolean;
        data?: {
            access_token: string;
            user_id: string;
            token_type?: string;
            expires_in?: number;
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
            const token = await this.threadsAuthService.exchangeCodeForShortToken(code);
            return {
                success: true,
                data: {
                    ...token,
                    state,
                },
            };
        } catch (error) {
            this.logger.error('Failed to exchange code for short-lived token', error);
            return {
                success: false,
                error: 'Failed to exchange code for short-lived token',
            };
        }
    }
}
