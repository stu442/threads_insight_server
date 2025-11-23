const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Handle standard API response wrapper if present (success: true, data: ...)
    if (result.success === false) {
        throw new Error(result.error || 'API request failed');
    }

    // If the API returns { success: true, data: ... }, return data. 
    // Otherwise return the result as is (for flexibility).
    return result.data !== undefined ? result.data : result;
}

export interface AnalyticsData {
    totalPosts: number;
    periodStats: {
        period: {
            from: string;
            to: string;
        };
        totalPosts: number;
        totalLikes: number;
        averageEngagement: number;
    };
    posts: Array<{
        id: string;
        caption: string;
        permalink: string;
        timestamp: string;
        metrics: {
            views: number;
            likes: number;
            replies: number;
            reposts: number;
            quotes: number;
            engagement: number;
        };
    }>;
}

export async function getAnalytics(userId: string): Promise<AnalyticsData> {
    return fetchAPI<AnalyticsData>(`/analytics?userId=${userId}`);
}
