export interface FormattedPost {
    id: string;
    caption: string;
    permalink: string;
    timestamp: string;
    tags: string[];
    category: string | null;
    metrics: {
        views: number;
        likes: number;
        replies: number;
        reposts: number;
        quotes: number;
        engagement: number;
    };
}

export interface InsightSummary {
    views?: number | null;
    likes?: number | null;
    replies?: number | null;
    reposts?: number | null;
    quotes?: number | null;
}

/**
 * 최근 N일 내 게시물 통계를 계산한다.
 */
export function calculateRecentStats(posts: FormattedPost[], days: number = 7): { totalLikes: number; averageEngagement: number } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentPosts = posts.filter(p => new Date(p.timestamp) >= cutoffDate);

    const totalLikes = recentPosts.reduce((sum, p) => sum + p.metrics.likes, 0);
    const totalEngagement = recentPosts.reduce((sum, p) => sum + p.metrics.engagement, 0);
    const averageEngagement = recentPosts.length > 0
        ? totalEngagement / recentPosts.length
        : 0;

    return {
        totalLikes,
        averageEngagement
    };
}

/**
 * 페이징 정보를 계산한다.
 */
export function getPaginationInfo(totalItems: number, page: number, pageSize: number): { totalPages: number; hasNext: boolean; hasPrev: boolean } {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        totalPages,
        hasNext,
        hasPrev
    };
}

/**
 * 페이징 범위에 맞게 배열을 자른다.
 */
export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
    const offset = (page - 1) * pageSize;
    return data.slice(offset, offset + pageSize);
}

/**
 * 캡션 길이에 따라 len-100, len-200 등 길이 태그를 생성한다.
 */
export function generateLengthTags(caption: string | null): string[] {
    const tags: string[] = [];
    const length = caption?.length || 0;

    if (length <= 100) {
        tags.push('len-100');
    } else if (length <= 200) {
        tags.push('len-200');
    } else if (length <= 300) {
        tags.push('len-300');
    } else if (length <= 400) {
        tags.push('len-400');
    } else {
        tags.push('len-500');
    }

    return tags;
}

/**
 * 인사이트에서 총 참여 수와 참여율을 계산한다.
 */
export function calcEngagement(insight: InsightSummary | null | undefined): { totalEngagements: number; engagementRate: number } {
    const likes = insight?.likes || 0;
    const replies = insight?.replies || 0;
    const reposts = insight?.reposts || 0;
    const quotes = insight?.quotes || 0;
    const views = insight?.views || 0;

    const totalEngagements = likes + replies + reposts + quotes;
    const engagementRate = views > 0 ? (totalEngagements / (views || 1)) * 100 : 0;

    return { totalEngagements, engagementRate };
}

/**
 * 기존 태그에 길이 태그를 병합하고 오래된 길이 태그는 제거한다.
 */
export function mergeTags(existingTags: string[] | null | undefined, lengthTags: string[]): string[] {
    const existingNonLengthTags = (existingTags || []).filter(tag => !tag.startsWith('len-'));
    const uniqueTags = new Set([...lengthTags, ...existingNonLengthTags]);
    return Array.from(uniqueTags);
}

/**
 * 시작/종료 날짜 문자열로 Prisma 날짜 필터를 만든다.
 */
export function buildDateFilter(startDate?: string, endDate?: string): { gte?: Date; lte?: Date } {
    const filter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
        filter.gte = new Date(startDate);
    }
    if (endDate) {
        filter.lte = new Date(endDate);
    }
    return filter;
}

export interface RawAnalyticsPost {
    id: string;
    caption: string | null;
    permalink: string;
    timestamp: Date;
    analytics?: { tags: string[]; category: string | null; engagementRate?: number | null } | null;
    insights: (InsightSummary & { updatedAt?: Date })[];
}

/**
 * DB에서 가져온 게시물을 포맷된 구조로 변환한다.
 */
export function formatPosts(posts: RawAnalyticsPost[]): FormattedPost[] {
    return posts.map(p => ({
        id: p.id,
        caption: p.caption || '',
        permalink: p.permalink,
        timestamp: p.timestamp.toISOString(),
        tags: p.analytics?.tags || [],
        category: p.analytics?.category || null,
        metrics: {
            views: p.insights[0]?.views || 0,
            likes: p.insights[0]?.likes || 0,
            replies: p.insights[0]?.replies || 0,
            reposts: p.insights[0]?.reposts || 0,
            quotes: p.insights[0]?.quotes || 0,
            engagement: parseFloat((p.analytics?.engagementRate || 0).toFixed(2))
        }
    }));
}

type SortBy = 'views' | 'likes' | 'engagement' | 'date';
type SortOrder = 'asc' | 'desc';

/**
 * 지정된 정렬 기준과 방향으로 게시물을 정렬한다.
 */
export function sortPosts(posts: FormattedPost[], sortBy: SortBy, sortOrder: SortOrder): FormattedPost[] {
    const normalizedSortBy: SortBy = ['views', 'likes', 'engagement', 'date'].includes(sortBy)
        ? (sortBy as SortBy)
        : 'date';
    const normalizedOrder: SortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    const order = normalizedOrder === 'asc' ? 1 : -1;
    return [...posts].sort((a, b) => {
        let valA, valB;
        switch (normalizedSortBy) {
            case 'views':
                valA = a.metrics.views;
                valB = b.metrics.views;
                break;
            case 'likes':
                valA = a.metrics.likes;
                valB = b.metrics.likes;
                break;
            case 'engagement':
                valA = a.metrics.engagement;
                valB = b.metrics.engagement;
                break;
            case 'date':
            default:
                valA = new Date(a.timestamp).getTime();
                valB = new Date(b.timestamp).getTime();
                break;
        }
        return (valA - valB) * order;
    });
}

export interface TagCorrelationInput {
    tags: string[];
    insight?: InsightSummary | null;
}

/**
 * 태그 단위로 합계/평균 지표를 집계한다.
 */
export function accumulateTagStats(posts: TagCorrelationInput[]) {
    const tagStats: Record<string, { count: number; views: number; likes: number; reposts: number; replies: number }> = {};

    for (const post of posts) {
        const insight = post.insight;
        if (!insight) continue;

        for (const tag of post.tags || []) {
            if (!tagStats[tag]) {
                tagStats[tag] = { count: 0, views: 0, likes: 0, reposts: 0, replies: 0 };
            }

            tagStats[tag].count++;
            tagStats[tag].views += insight.views || 0;
            tagStats[tag].likes += insight.likes || 0;
            tagStats[tag].reposts += insight.reposts || 0;
            tagStats[tag].replies += insight.replies || 0;
        }
    }

    const result = Object.entries(tagStats).map(([tag, stats]) => ({
        tag,
        count: stats.count,
        avgViews: stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
        avgLikes: stats.count > 0 ? Math.round(stats.likes / stats.count) : 0,
        avgReposts: stats.count > 0 ? Math.round(stats.reposts / stats.count) : 0,
        avgReplies: stats.count > 0 ? Math.round(stats.replies / stats.count) : 0,
        totalViews: stats.views,
        totalLikes: stats.likes,
        totalReposts: stats.reposts,
        totalReplies: stats.replies
    }));

    return result.sort((a, b) => a.tag.localeCompare(b.tag));
}

export interface CategoryStatsInput {
    category: string | null;
    insight?: InsightSummary | null;
}

/**
 * 카테고리 단위로 합계/평균 지표를 집계한다.
 */
export function accumulateCategoryStats(posts: CategoryStatsInput[]) {
    const categoryStats: Record<string, { count: number; views: number; likes: number; replies: number }> = {};

    for (const post of posts) {
        const insight = post.insight;
        if (!insight) continue;

        const category = post.category || 'Uncategorized';

        if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, views: 0, likes: 0, replies: 0 };
        }

        categoryStats[category].count++;
        categoryStats[category].views += insight.views || 0;
        categoryStats[category].likes += insight.likes || 0;
        categoryStats[category].replies += insight.replies || 0;
    }

    const result = Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        count: stats.count,
        avgViews: stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
        avgLikes: stats.count > 0 ? Math.round(stats.likes / stats.count) : 0,
        avgReplies: stats.count > 0 ? Math.round(stats.replies / stats.count) : 0,
        totalViews: stats.views,
        totalLikes: stats.likes,
        totalReplies: stats.replies
    }));

    return result.sort((a, b) => b.totalViews - a.totalViews || a.category.localeCompare(b.category));
}

export interface TimeInsightInput {
    timestamp: Date;
    insight?: InsightSummary | null;
}

/**
 * 인사이트를 KST 기준 시간대별로 묶어 평균을 계산한다.
 */
export function bucketHourlyStats(posts: TimeInsightInput[]) {
    const hourlyStats: Record<number, { count: number; views: number; likes: number; replies: number; reposts: number }> = {};
    for (let i = 0; i < 24; i++) {
        hourlyStats[i] = { count: 0, views: 0, likes: 0, replies: 0, reposts: 0 };
    }

    for (const post of posts) {
        const insight = post.insight;
        if (!insight) continue;

        const date = new Date(post.timestamp);
        const hour = (date.getUTCHours() + 9) % 24; // KST (UTC+9)

        hourlyStats[hour].count++;
        hourlyStats[hour].views += insight.views || 0;
        hourlyStats[hour].likes += insight.likes || 0;
        hourlyStats[hour].replies += insight.replies || 0;
        hourlyStats[hour].reposts += insight.reposts || 0;
    }

    const result = Object.entries(hourlyStats).map(([hour, stats]) => ({
        hour: parseInt(hour),
        count: stats.count,
        avgViews: stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
        avgLikes: stats.count > 0 ? Math.round(stats.likes / stats.count) : 0,
        avgReplies: stats.count > 0 ? Math.round(stats.replies / stats.count) : 0,
        avgReposts: stats.count > 0 ? Math.round(stats.reposts / stats.count) : 0
    }));

    return result.sort((a, b) => a.hour - b.hour);
}

/**
 * 인사이트를 KST 기준 요일별로 묶어 평균을 계산한다.
 */
export function bucketDayOfWeekStatsKST(posts: TimeInsightInput[]) {
    const dailyStats: Record<number, { count: number; views: number; likes: number; replies: number; reposts: number }> = {};
    for (let i = 0; i < 7; i++) {
        dailyStats[i] = { count: 0, views: 0, likes: 0, replies: 0, reposts: 0 };
    }

    for (const post of posts) {
        const insight = post.insight;
        if (!insight) continue;

        const date = new Date(post.timestamp);
        const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000); // shift to KST
        const day = kstDate.getUTCDay(); // 0 (Sunday) - 6 (Saturday)

        dailyStats[day].count++;
        dailyStats[day].views += insight.views || 0;
        dailyStats[day].likes += insight.likes || 0;
        dailyStats[day].replies += insight.replies || 0;
        dailyStats[day].reposts += insight.reposts || 0;
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const result = Object.entries(dailyStats).map(([day, stats]) => ({
        dayIndex: parseInt(day),
        day: days[parseInt(day)],
        count: stats.count,
        avgViews: stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
        avgLikes: stats.count > 0 ? Math.round(stats.likes / stats.count) : 0,
        avgReplies: stats.count > 0 ? Math.round(stats.replies / stats.count) : 0,
        avgReposts: stats.count > 0 ? Math.round(stats.reposts / stats.count) : 0
    }));

    return result.sort((a, b) => a.dayIndex - b.dayIndex);
}
