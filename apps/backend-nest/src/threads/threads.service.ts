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

interface ThreadsPagingResponse {
    data: ThreadsMedia[];
    paging?: {
        cursors?: {
            before: string;
            after: string;
        };
        next?: string;
        previous?: string;
    };
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

    async getAllMedia(token: string, userId: string, maxLimit?: number): Promise<ThreadsMedia[]> {
        const allPosts: ThreadsMedia[] = [];
        let nextUrl: string | undefined = `${this.baseUrl}/${userId}/threads`;

        while (nextUrl) {
            try {
                const isFirstRequest = nextUrl === `${this.baseUrl}/${userId}/threads`;
                const response = await axios.get<ThreadsPagingResponse>(nextUrl, {
                    params: isFirstRequest ? {
                        fields: 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,is_quote_post',
                        access_token: token,
                        limit: 100,
                    } : undefined, // next URL already includes all parameters
                });

                if (response.data?.data) {
                    allPosts.push(...response.data.data);
                    this.logger.log(`Fetched ${response.data.data.length} posts, total: ${allPosts.length}`);
                }

                // Check maxLimit
                if (maxLimit && allPosts.length >= maxLimit) {
                    this.logger.log(`Reached maxLimit: ${maxLimit}`);
                    return allPosts.slice(0, maxLimit);
                }

                // Continue to next page if available
                nextUrl = response.data?.paging?.next;
            } catch (error) {
                this.logger.error(`Error fetching media page`, error);
                throw error;
            }
        }

        this.logger.log(`Completed fetching all media. Total: ${allPosts.length}`);
        return allPosts;
    }

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

    async getRecentMediaWithinDays(
        token: string,
        userId: string,
        days: number = 7,
        pageSize: number = 100,
    ): Promise<ThreadsMedia[]> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const collected: ThreadsMedia[] = [];
        let nextUrl: string | undefined = `${this.baseUrl}/${userId}/threads`;

        while (nextUrl) {
            const isFirstRequest = nextUrl === `${this.baseUrl}/${userId}/threads`;
            const response = await axios.get<ThreadsPagingResponse>(nextUrl, {
                params: isFirstRequest
                    ? {
                        fields: 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,is_quote_post',
                        access_token: token,
                        limit: pageSize,
                    }
                    : undefined,
            });

            if (!response.data?.data?.length) {
                break;
            }

            const page = response.data.data;
            for (const post of page) {
                if (new Date(post.timestamp) >= cutoff) {
                    collected.push(post);
                }
            }

            const lastPost = page[page.length - 1];
            const lastPostDate = new Date(lastPost.timestamp);
            if (lastPostDate < cutoff) {
                break; // remaining pages would be older than cutoff
            }

            nextUrl = response.data.paging?.next;
        }

        this.logger.log(`Fetched ${collected.length} posts within last ${days} days for user ${userId}`);
        return collected;
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
            this.logger.debug(`Using token: ${token.substring(0, 10)}...`);
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
