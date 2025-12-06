import {
    accumulateCategoryStats,
    accumulateTagStats,
    buildDateFilter,
    bucketDayOfWeekStatsKST,
    bucketHourlyStats,
    calcEngagement,
    formatPosts,
    generateLengthTags,
    mergeTags,
    sortPosts
} from './analytics.util';

describe('analytics util functions', () => {
    describe('generateLengthTags', () => {
        it.each([
            { caption: null, expected: ['len-100'], label: 'null 캡션은 길이 0으로 처리' },
            { caption: '', expected: ['len-100'], label: '빈 문자열' },
            { caption: 'a'.repeat(100), expected: ['len-100'], label: '정확히 100자' },
            { caption: 'a'.repeat(150), expected: ['len-200'], label: '101~200자' },
            { caption: 'a'.repeat(250), expected: ['len-300'], label: '201~300자' },
            { caption: 'a'.repeat(350), expected: ['len-400'], label: '301~400자' },
            { caption: 'a'.repeat(450), expected: ['len-500'], label: '400자 초과' }
        ])('$label 시 $expected 반환', ({ caption, expected }) => {
            expect(generateLengthTags(caption)).toEqual(expected);
        });
    });

    it('calcEngagement는 총합과 참여율을 계산하고 조회수 0일 때 0을 반환한다', () => {
        const insight = { likes: 10, replies: 5, reposts: 3, quotes: 2, views: 100 };
        expect(calcEngagement(insight)).toEqual({ totalEngagements: 20, engagementRate: 20 });
        expect(calcEngagement({ likes: 1, views: 0 }).engagementRate).toBe(0);
    });

    it('mergeTags는 새로운 길이 태그와 기존 비-길이 태그만 유지한다', () => {
        const existing = ['len-200', 'topic', 'len-300', 'news'];
        const lengthTags = ['len-100'];
        expect(mergeTags(existing, lengthTags).sort()).toEqual(['len-100', 'news', 'topic'].sort());
    });

    it('buildDateFilter는 날짜가 없으면 빈 객체, 있으면 경계를 만든다', () => {
        expect(buildDateFilter()).toEqual({});
        const filter = buildDateFilter('2024-01-01', '2024-02-01');
        expect(filter.gte?.toISOString().startsWith('2024-01-01')).toBe(true);
        expect(filter.lte?.toISOString().startsWith('2024-02-01')).toBe(true);
    });

    it('formatPosts는 Raw 포스트를 포맷 구조로 변환한다', () => {
        const raw = [{
            id: '1',
            caption: null,
            permalink: 'link',
            timestamp: new Date('2024-01-01T00:00:00Z'),
            analytics: { tags: ['len-100'], category: 'cat', engagementRate: 12.345 },
            insights: [{ views: 10, likes: 2, replies: 1, reposts: 0, quotes: 0 }]
        }];
        const formatted = formatPosts(raw);
        expect(formatted[0].caption).toBe('');
        expect(formatted[0].metrics.engagement).toBe(12.35);
        expect(formatted[0].metrics.likes).toBe(2);
    });

    it('sortPosts는 기준과 정렬 방향에 맞춰 정렬한다', () => {
        const posts = [
            { id: '1', caption: '', permalink: '', timestamp: '2024-01-02T00:00:00Z', tags: [], category: null, metrics: { views: 10, likes: 5, replies: 0, reposts: 0, quotes: 0, engagement: 2 } },
            { id: '2', caption: '', permalink: '', timestamp: '2024-01-01T00:00:00Z', tags: [], category: null, metrics: { views: 20, likes: 1, replies: 0, reposts: 0, quotes: 0, engagement: 1 } }
        ];
        expect(sortPosts(posts, 'views', 'desc').map(p => p.id)).toEqual(['2', '1']);
        expect(sortPosts(posts, 'date', 'asc').map(p => p.id)).toEqual(['2', '1']);
    });

    it('accumulateTagStats는 태그별 합계와 평균을 집계한다', () => {
        const stats = accumulateTagStats([
            { tags: ['a', 'b'], insight: { views: 10, likes: 2, reposts: 1, replies: 0 } },
            { tags: ['a'], insight: { views: 20, likes: 4, reposts: 2, replies: 2 } },
            { tags: ['c'], insight: null }
        ]);
        const tagA = stats.find(s => s.tag === 'a');
        expect(tagA).toMatchObject({ count: 2, totalViews: 30, avgViews: 15 });
        const tagB = stats.find(s => s.tag === 'b');
        expect(tagB).toMatchObject({ count: 1, totalLikes: 2 });
        expect(stats.some(s => s.tag === 'c')).toBe(false);
    });

    it('accumulateCategoryStats는 카테고리별로 집계하고 null은 Uncategorized로 처리한다', () => {
        const stats = accumulateCategoryStats([
            { category: 'Tech', insight: { views: 10, likes: 1, replies: 1 } },
            { category: null, insight: { views: 30, likes: 2, replies: 0 } }
        ]);
        expect(stats.find(s => s.category === 'Tech')?.avgViews).toBe(10);
        expect(stats.find(s => s.category === 'Uncategorized')?.totalViews).toBe(30);
    });

    it('bucketHourlyStats는 KST 기준 시각으로 묶어 평균을 낸다', () => {
        const base = new Date('2024-01-01T00:00:00Z'); // KST 09:00
        const stats = bucketHourlyStats([
            { timestamp: base, insight: { views: 10, likes: 2, replies: 0, reposts: 0 } },
            { timestamp: new Date('2024-01-01T01:30:00Z'), insight: { views: 20, likes: 2, replies: 0, reposts: 0 } } // KST 10:30
        ]);
        const hour9 = stats.find(s => s.hour === 9);
        const hour10 = stats.find(s => s.hour === 10);
        expect(hour9?.avgViews).toBe(10);
        expect(hour10?.avgViews).toBe(20);
    });

    it('bucketDayOfWeekStatsKST는 KST로 변환 후 요일별로 묶는다', () => {
        // 2024-01-06 18:00 UTC is 2024-01-07 03:00 KST (Sunday)
        const stats = bucketDayOfWeekStatsKST([
            { timestamp: new Date('2024-01-06T18:00:00Z'), insight: { views: 10, likes: 1, replies: 0, reposts: 0 } }
        ]);
        const sunday = stats.find(s => s.day === 'Sun');
        expect(sunday?.count).toBe(1);
    });
});
