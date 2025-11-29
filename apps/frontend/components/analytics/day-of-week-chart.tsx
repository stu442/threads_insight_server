"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/api"

interface DayOfWeekData {
    dayIndex: number
    day: string
    count: number
    avgViews: number
    avgLikes: number
    avgReplies: number
    avgReposts: number
}

export function DayOfWeekChart() {
    const [data, setData] = useState<DayOfWeekData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const me = await getCurrentUser()
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/day-of-week?userId=${me.threadsUserId}`, {
                    credentials: "include"
                })
                const result = await response.json()
                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error("Failed to fetch day of week analytics", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                    <CardTitle>Day of Week Analysis</CardTitle>
                    <CardDescription>요일별 평균 참여도</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader>
                <CardTitle>Day of Week Analysis</CardTitle>
                <CardDescription>요일별 평균 참여도 지표</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="day"
                                className="text-xs text-muted-foreground"
                            />
                            <YAxis
                                yAxisId="left"
                                className="text-xs text-muted-foreground"
                                label={{ value: 'Likes / Replies', angle: -90, position: 'insideLeft', offset: 10, style: { fill: 'hsl(var(--muted-foreground))', fontSize: '12px' } }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                className="text-xs text-muted-foreground"
                                label={{ value: 'Views', angle: 90, position: 'insideRight', offset: 10, style: { fill: 'hsl(var(--muted-foreground))', fontSize: '12px' } }}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload as DayOfWeekData;
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
                            <Bar yAxisId="right" dataKey="avgViews" name="Avg Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                            <Line yAxisId="left" type="monotone" dataKey="avgLikes" name="Avg Likes" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={false} />
                            <Line yAxisId="left" type="monotone" dataKey="avgReplies" name="Avg Replies" stroke="hsl(221 83% 53%)" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
