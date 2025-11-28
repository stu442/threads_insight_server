import { AppShell } from "@/components/layout/app-shell"
import { KPICard } from "@/components/kpi-card"
import { TagDistributionChart } from "@/components/analytics/tag-distribution-chart"
import { TopicAnalysisChart } from "@/components/analytics/topic-analysis-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricsComparisonChart } from "@/components/analytics/metrics-comparison-chart"
import { TagCorrelationChart } from "@/components/analytics/tag-correlation-chart"
import { CategoryPerformanceChart } from "@/components/analytics/category-performance-chart"
import { TrendingUp, Eye, Heart, MessageCircle } from "lucide-react"
import { TimeOfDayChart } from "@/components/analytics/time-of-day-chart"
import { DayOfWeekChart } from "@/components/analytics/day-of-week-chart"

export default function AnalyzePage() {
    return (
        <AppShell className="max-w-7xl space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">📈 Analytics</h1>
                <p className="text-sm text-muted-foreground">
                    태그, 토픽, engagement 등 주요 지표를 분석하세요.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Posts"
                    value="126"
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <KPICard
                    title="Avg Views"
                    value="1,735"
                    icon={<Eye className="h-4 w-4" />}
                    subtext="+12.3% from last week"
                />
                <KPICard
                    title="Avg Likes"
                    value="137"
                    icon={<Heart className="h-4 w-4" />}
                    subtext="+8.5% from last week"
                />
                <KPICard
                    title="Avg Engagement"
                    value="7.9%"
                    icon={<MessageCircle className="h-4 w-4" />}
                    subtext="+2.1% from last week"
                />
            </div>

            {/* Charts Grid */}
            <div className="space-y-6">

                {/* Category Performance */}
                <CategoryPerformanceChart />

                {/* Tag Correlation Analysis */}
                <TagCorrelationChart />

                {/* Time Analysis Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <TimeOfDayChart />
                    <DayOfWeekChart />
                </div>

                {/* Two Column Layout */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <TagDistributionChart />
                    <TopicAnalysisChart />
                </div>

                {/* Metrics Comparison */}
                <MetricsComparisonChart />
            </div>
        </AppShell>
    )
}
