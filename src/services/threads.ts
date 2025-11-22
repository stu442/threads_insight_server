import axios from 'axios';
import logger from '../utils/logger';

const THREADS_API_BASE = 'https://graph.threads.net/v1.0';

export class ThreadsService {
    private accessToken: string;
    private userId: string;

    constructor(accessToken: string, userId: string) {
        this.accessToken = accessToken;
        this.userId = userId;
    }

    async getMedia(limit: number = 10) {
        try {
            const response = await axios.get(`${THREADS_API_BASE}/${this.userId}/threads`, {
                params: {
                    access_token: this.accessToken,
                    fields: 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post',
                    limit: limit
                }
            });
            logger.info(`Threads API Response for getMedia: ${JSON.stringify(response.data)}`);
            return response.data.data;
        } catch (error) {
            logger.error('Error fetching media:', error);
            throw error;
        }
    }

    async getInsights(mediaId: string) {
        try {
            const response = await axios.get(`${THREADS_API_BASE}/${mediaId}/insights`, {
                params: {
                    access_token: this.accessToken,
                    metric: 'views,likes,replies,reposts,quotes'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching insights for media ${mediaId}:`, error);
            return []; // Return empty array if insights fail (e.g. too old)
        }
    }
}
