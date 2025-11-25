"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MetricsComparisonChartProps {
    data?: Array<{
        date: string
        views: number
        likes: number
        engagement: number
    }>
}

export function MetricsComparisonChart({ data }: MetricsComparisonChartProps) {
    // Mock data for visualization
    const mockData = data || [
        { date: "Nov 18", views: 1200, likes: 89, engagement: 7.4 },
        { date: "Nov 19", views: 1850, likes: 142, engagement: 7.7 },
        { date: "Nov 20", views: 980, likes: 71, engagement: 7.2 },
        { date: "Nov 21", views: 2100, likes: 178, engagement: 8.5 },
        { date: "Nov 22", views: 1650, likes: 125, engagement: 7.6 },
        { date: "Nov 23", views: 2450, likes: 201, engagement: 8.2 },
        { date: "Nov 24", views: 1920, likes: 156, engagement: 8.1 },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Metrics Comparison</CardTitle>
                <CardDescription>Views, Likes 및 Engagement 비교</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            yAxisId="left"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            domain={[0, 10]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px'
                            }}
                        />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="views"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            name="Views"
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="likes"
                            fill="hsl(142 76% 36%)"
                            radius={[4, 4, 0, 0]}
                            name="Likes"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="engagement"
                            stroke="hsl(280 100% 70%)"
                            strokeWidth={3}
                            dot={{ fill: 'hsl(280 100% 70%)', r: 5 }}
                            name="Engagement %"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
