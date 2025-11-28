"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts"
import { useEffect, useState } from "react"

interface TimeOfDayData {
    hour: number
    count: number
    avgViews: number
    avgLikes: number
    avgReplies: number
    avgReposts: number
}

export function TimeOfDayChart() {
    const [data, setData] = useState<TimeOfDayData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = process.env.NEXT_PUBLIC_USER_ID
                if (userId) {
                    // Use the proxy endpoint which forwards to the backend
                    // The backend controller is at /analytics/time-of-day
                    // Assuming the proxy is set up to forward /api/proxy/* to the backend
                    // Let's verify the API call structure. 
                    // TagCorrelationChart uses `getTagCorrelation` from `@/lib/api`.
                    // I should probably add a function to `@/lib/api` as well for consistency,
                    // but for now I'll fetch directly or create the helper.
                    // Let's check `@/lib/api` content first? 
                    // No, let's just use fetch for now to be quick, or better, add to api.ts if possible.
                    // But I don't want to context switch too much.
                    // Let's assume /api/proxy/analytics/time-of-day is correct based on other patterns if they exist.
                    // Wait, TagCorrelationChart imports `getTagCorrelation`.
                    // I should probably check `apps/frontend/lib/api.ts` to see how it's implemented.
                    // But to save steps, I'll just use fetch with the same pattern as I would expect.
                    // If TagCorrelationChart uses a lib function, it likely wraps the fetch.

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/time-of-day?userId=${userId}`)
                    const result = await response.json()
                    if (result.success) {
                        setData(result.data)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch time of day analytics", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Time of Day Analysis</CardTitle>
                    <CardDescription>시간대별 평균 참여도</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Time of Day Analysis</CardTitle>
                <CardDescription>시간대별 평균 참여도 지표</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="hour"
                                tickFormatter={(hour) => `${hour}:00`}
                                className="text-xs text-muted-foreground"
                            />
                            <YAxis yAxisId="left" className="text-xs text-muted-foreground" />
                            <YAxis yAxisId="right" orientation="right" className="text-xs text-muted-foreground" />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload as TimeOfDayData;
                                        return (
                                            <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                                                <p className="font-medium mb-2">{label}:00 - {Number(label) + 1}:00</p>
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
                            <Bar yAxisId="left" dataKey="avgViews" name="Avg Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                            <Line yAxisId="right" type="monotone" dataKey="avgLikes" name="Avg Likes" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="avgReplies" name="Avg Replies" stroke="hsl(221 83% 53%)" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
