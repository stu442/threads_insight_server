import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ShortLivedTokenResponse {
    access_token: string;
    user_id: string;
    token_type?: string;
    expires_in?: number;
}

@Injectable()
export class ThreadsAuthService {
    private readonly logger = new Logger(ThreadsAuthService.name);
    private readonly oauthBase = 'https://graph.threads.net/oauth';
    private readonly authorizeUrl = 'https://www.threads.net/oauth/authorize';

    constructor(private readonly config: ConfigService) { }

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
}
