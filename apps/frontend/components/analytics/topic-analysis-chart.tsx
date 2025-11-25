"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TopicAnalysisChartProps {
    data?: Array<{
        topic: string
        posts: number
        avgEngagement: number
    }>
}

export function TopicAnalysisChart({ data }: TopicAnalysisChartProps) {
    // Mock data for visualization
    const mockData = data || [
        { topic: "Personal Growth", posts: 32, avgEngagement: 8.5 },
        { topic: "Technology", posts: 28, avgEngagement: 7.2 },
        { topic: "Business Tips", posts: 24, avgEngagement: 9.1 },
        { topic: "Life Hacks", posts: 21, avgEngagement: 6.8 },
        { topic: "Career", posts: 18, avgEngagement: 7.9 },
        { topic: "Health & Fitness", posts: 15, avgEngagement: 8.3 },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Topic Analysis</CardTitle>
                <CardDescription>토픽별 게시물 수 및 평균 engagement</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="topic"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            angle={-15}
                            textAnchor="end"
                            height={80}
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
                            dataKey="posts"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            name="Posts"
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="avgEngagement"
                            fill="hsl(142 76% 36%)"
                            radius={[4, 4, 0, 0]}
                            name="Avg Engagement %"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
