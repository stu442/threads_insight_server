import axios from 'axios';
import { ThreadsService } from './threads';
import logger from '../utils/logger';

// Mock axios and logger
jest.mock('axios');
jest.mock('../utils/logger')

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ThreadsService', () => {
    const mockAccessToken = 'test-access-token';
    const mockUserId = 'test-user-id';
    let threadsService: ThreadsService;

    beforeEach(() => {
        threadsService = new ThreadsService(mockAccessToken, mockUserId);
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    describe('getMedia', () => {
        it('should return media data successfully', async () => {
            const mockMediaData = [
                {
                    id: '123',
                    media_type: 'IMAGE',
                    text: 'Test post',
                    timestamp: '2024-01-01T00:00:00Z',
                },
                {
                    id: '456',
                    media_type: 'VIDEO',
                    text: 'Another post',
                    timestamp: '2024-01-02T00:00:00Z',
                },
            ];

            mockedAxios.get.mockResolvedValueOnce({
                data: { data: mockMediaData },
            });

            const result = await threadsService.getMedia(10);

            expect(result).toEqual(mockMediaData);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `https://graph.threads.net/v1.0/${mockUserId}/threads`,
                {
                    params: {
                        access_token: mockAccessToken,
                        fields: 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post',
                        limit: 10,
                    },
                }
            );
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Threads API Response for getMedia')
            );
        });

        it('should use default limit of 10 when not provided', async () => {
            const mockMediaData: any[] = [];
            mockedAxios.get.mockResolvedValueOnce({
                data: { data: mockMediaData },
            });

            await threadsService.getMedia();

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    params: expect.objectContaining({
                        limit: 10,
                    }),
                })
            );
        });

        it('should respect custom limit parameter', async () => {
            const mockMediaData: any[] = [];
            mockedAxios.get.mockResolvedValueOnce({
                data: { data: mockMediaData },
            });

            await threadsService.getMedia(25);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    params: expect.objectContaining({
                        limit: 25,
                    }),
                })
            );
        });

        it('should throw error when API request fails', async () => {
            const mockError = new Error('API request failed');
            mockedAxios.get.mockRejectedValueOnce(mockError);

            await expect(threadsService.getMedia(10)).rejects.toThrow(
                'API request failed'
            );
            expect(logger.error).toHaveBeenCalledWith(
                'Error fetching media:',
                mockError
            );
        });
    });

    describe('getInsights', () => {
        const mockMediaId = 'media-123';

        it('should return insights data successfully', async () => {
            const mockInsightsData = [
                { name: 'views', values: [{ value: 100 }] },
                { name: 'likes', values: [{ value: 50 }] },
                { name: 'replies', values: [{ value: 10 }] },
            ];

            mockedAxios.get.mockResolvedValueOnce({
                data: { data: mockInsightsData },
            });

            const result = await threadsService.getInsights(mockMediaId);

            expect(result).toEqual(mockInsightsData);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `https://graph.threads.net/v1.0/${mockMediaId}/insights`,
                {
                    params: {
                        access_token: mockAccessToken,
                        metric: 'views,likes,replies,reposts,quotes',
                    },
                }
            );
        });

        it('should return empty array when API request fails', async () => {
            const mockError = new Error('Insights not available');
            mockedAxios.get.mockRejectedValueOnce(mockError);

            const result = await threadsService.getInsights(mockMediaId);

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalledWith(
                `Error fetching insights for media ${mockMediaId}:`,
                mockError
            );
        });

        it('should handle network errors gracefully', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

            const result = await threadsService.getInsights(mockMediaId);

            expect(result).toEqual([]);
        });
    });
});
