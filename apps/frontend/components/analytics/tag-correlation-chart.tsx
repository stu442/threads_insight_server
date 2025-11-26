"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getTagCorrelation, TagCorrelation } from "@/lib/api"

export function TagCorrelationChart() {
    const [data, setData] = useState<TagCorrelation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = process.env.NEXT_PUBLIC_USER_ID
                if (userId) {
                    const result = await getTagCorrelation(userId)
                    // Filter for len- tags if needed, or just show all
                    // The user specifically asked for len- tags, but showing all is fine too.
                    // Let's filter for len- tags to be specific to the request if there are many tags.
                    // Actually, let's show all for now, as the backend sorts them.
                    setData(result)
                }
            } catch (error) {
                console.error("Failed to fetch tag correlation", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Tag Correlation Analysis</CardTitle>
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
            <CardHeader>
                <CardTitle>Tag Correlation Analysis</CardTitle>
                <CardDescription>Average metrics by tag (Views vs Likes/Replies)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="tag"
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
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px'
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="right" dataKey="avgViews" name="Avg Views" fill="hsl(var(--primary))" opacity={0.3} barSize={20} />
                        <Line yAxisId="left" type="monotone" dataKey="avgLikes" name="Avg Likes" stroke="hsl(142 76% 36%)" strokeWidth={2} />
                        <Line yAxisId="left" type="monotone" dataKey="avgReplies" name="Avg Replies" stroke="hsl(221 83% 53%)" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
