"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TagDistributionChartProps {
    data?: Array<{
        tag: string
        count: number
    }>
}

export function TagDistributionChart({ data }: TagDistributionChartProps) {
    // Mock data for visualization
    const mockData = data || [
        { tag: "motivation", count: 24 },
        { tag: "productivity", count: 19 },
        { tag: "life-tips", count: 16 },
        { tag: "tech", count: 14 },
        { tag: "business", count: 12 },
        { tag: "len-200", count: 11 },
        { tag: "wellness", count: 9 },
        { tag: "len-300", count: 8 },
        { tag: "career", count: 7 },
        { tag: "startup", count: 6 },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tag Distribution</CardTitle>
                <CardDescription>상위 10개 태그별 게시물 수</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={mockData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            type="number"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            type="category"
                            dataKey="tag"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px'
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
