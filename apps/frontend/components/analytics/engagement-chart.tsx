"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface EngagementChartProps {
    data?: Array<{
        date: string
        views: number
        likes: number
        replies: number
        reposts: number
    }>
}

export function EngagementChart({ data }: EngagementChartProps) {
    // Mock data for visualization
    const mockData = data || [
        { date: "Nov 18", views: 1200, likes: 89, replies: 12, reposts: 8 },
        { date: "Nov 19", views: 1850, likes: 142, replies: 18, reposts: 15 },
        { date: "Nov 20", views: 980, likes: 71, replies: 9, reposts: 5 },
        { date: "Nov 21", views: 2100, likes: 178, replies: 24, reposts: 19 },
        { date: "Nov 22", views: 1650, likes: 125, replies: 16, reposts: 11 },
        { date: "Nov 23", views: 2450, likes: 201, replies: 31, reposts: 23 },
        { date: "Nov 24", views: 1920, likes: 156, replies: 21, reposts: 14 },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>7일간 engagement 지표 추이</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="views"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="likes"
                            stroke="hsl(142 76% 36%)"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(142 76% 36%)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="replies"
                            stroke="hsl(221 83% 53%)"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(221 83% 53%)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="reposts"
                            stroke="hsl(280 100% 70%)"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(280 100% 70%)' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
