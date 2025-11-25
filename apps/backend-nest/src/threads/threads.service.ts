import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface ThreadsMedia {
    id: string;
    media_product_type: string;
    media_type: string;
    media_url: string;
    permalink: string;
    owner: {
        id: string;
    };
    username: string;
    text: string;
    timestamp: string;
    shortcode: string;
    is_quote_post: boolean;
}

interface ThreadsInsight {
    name: string;
    period: string;
    values: {
        value: number;
    }[];
    title: string;
    description: string;
    id: string;
}

export interface ThreadsProfile {
    id: string;
    username: string;
    name?: string;
    threads_profile_picture_url?: string;
    threads_biography?: string;
    profile_picture_url?: string; // fallback for older field naming in upstream
    biography?: string; // fallback for older field naming in upstream
    is_verified?: boolean;
}

@Injectable()
export class ThreadsService {
    private readonly logger = new Logger(ThreadsService.name);
    private readonly baseUrl = 'https://graph.threads.net/v1.0';

    constructor() { }

    async getMedia(token: string, userId: string, limit: number = 10): Promise<ThreadsMedia[]> {
        try {
            this.logger.log(`Fetching media for user ${userId} with limit ${limit}`);
            const url = `${this.baseUrl}/${userId}/threads`;
            const response = await axios.get(url, {
                params: {
                    fields: 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,is_quote_post',
                    access_token: token,
                    limit: limit,
                },
            });

            if (response.data && response.data.data) {
                this.logger.log(`Successfully fetched ${response.data.data.length} posts`);
                return response.data.data;
            }
            return [];
        } catch (error) {
            this.logger.error('Error fetching media from Threads API', error);
            throw error;
        }
    }

    async getInsights(token: string, mediaId: string): Promise<ThreadsInsight[]> {
        try {
            this.logger.log(`Fetching insights for media ${mediaId}`);
            const url = `${this.baseUrl}/${mediaId}/insights`;
            const response = await axios.get(url, {
                params: {
                    metric: 'views,likes,replies,reposts,quotes',
                    access_token: token,
                },
            });

            if (response.data && response.data.data) {
                this.logger.log(`Successfully fetched insights for media ${mediaId}`);
                return response.data.data;
            }
            return [];
        } catch (error) {
            this.logger.error(`Error fetching insights for media ${mediaId}`, error);
            return [];
        }
    }

    async getProfile(token: string, userId: string): Promise<ThreadsProfile> {
        try {
            this.logger.log(`Fetching profile for user ${userId}`);
            const url = `${this.baseUrl}/${userId}`;
            const response = await axios.get(url, {
                params: {
                    fields: 'id,username,name,threads_profile_picture_url,threads_biography,is_verified',
                    access_token: token,
                },
            });

            if (response.data) {
                this.logger.log(`Successfully fetched profile for user ${userId}`);
                return response.data;
            }

            throw new Error('No profile data returned from Threads API');
        } catch (error) {
            // Surface upstream error details to make diagnosing failures easier
            if (axios.isAxiosError(error)) {
                this.logger.error(
                    `Error fetching profile for user ${userId} - status: ${error.response?.status}, data: ${JSON.stringify(error.response?.data)}`,
                );
            } else {
                this.logger.error(`Error fetching profile for user ${userId}`, error);
            }
            throw error;
        }
    }
}
