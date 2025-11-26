"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { CategoryMetrics, getCategoryMetrics } from "@/lib/api"

export function CategoryPerformanceChart() {
    const [data, setData] = useState<CategoryMetrics[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = process.env.NEXT_PUBLIC_USER_ID
                if (userId) {
                    const result = await getCategoryMetrics(userId)
                    setData(result)
                }
            } catch (error) {
                console.error("Failed to fetch category metrics", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const chartData = useMemo(() => data.slice(0, 8), [data])

    if (loading) {
        return (
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-2">
            <CardHeader className="flex flex-col gap-3">
                <div>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>카테고리별 평균 조회수 · 좋아요 · 답글</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.slice(0, 6).map(item => (
                        <Badge key={item.category} variant="secondary">{item.category}</Badge>
                    ))}
                    {data.length > 6 && (
                        <Badge variant="outline">+{data.length - 6} more</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="category"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            yAxisId="left"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            label={{ value: 'Likes / Replies', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            label={{ value: 'Views', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const point = payload[0].payload as CategoryMetrics;
                                    return (
                                        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                                            <p className="font-medium mb-2">{label}</p>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    <span className="text-muted-foreground">Posts:</span>
                                                    <span className="font-medium ml-auto">{point.count}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                                                    <span className="text-muted-foreground">Avg Views:</span>
                                                    <span className="font-medium ml-auto">{point.avgViews.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[hsl(142,76%,36%)]" />
                                                    <span className="text-muted-foreground">Avg Likes:</span>
                                                    <span className="font-medium ml-auto">{point.avgLikes.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[hsl(221,83%,53%)]" />
                                                    <span className="text-muted-foreground">Avg Replies:</span>
                                                    <span className="font-medium ml-auto">{point.avgReplies.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Bar
                            yAxisId="right"
                            dataKey="avgViews"
                            name="Avg Views"
                            fill="hsl(var(--primary))"
                            opacity={0.35}
                            barSize={22}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avgLikes"
                            name="Avg Likes"
                            stroke="hsl(142 76% 36%)"
                            strokeWidth={2}
                            dot={{ r: 3, fill: 'hsl(142 76% 36%)' }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avgReplies"
                            name="Avg Replies"
                            stroke="hsl(221 83% 53%)"
                            strokeWidth={2}
                            dot={{ r: 3, fill: 'hsl(221 83% 53%)' }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
