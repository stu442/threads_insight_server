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
}
