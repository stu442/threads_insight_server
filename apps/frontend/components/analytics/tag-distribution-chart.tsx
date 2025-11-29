"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { getCurrentUser, getTagCorrelation, TagCorrelation } from "@/lib/api"

export function TagDistributionChart() {
    const [data, setData] = useState<TagCorrelation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const me = await getCurrentUser()
                const result = await getTagCorrelation(me.threadsUserId)
                // Sort by count descending and take top 10
                const sortedData = result
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                setData(sortedData)
            } catch (error) {
                console.error("Failed to fetch tag distribution", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tag Distribution</CardTitle>
                    <CardDescription>Loading data...</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tag Distribution</CardTitle>
                <CardDescription>Top 10 tags by post count</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                                            <p className="font-medium mb-1">{label}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Posts:</span>
                                                <span className="font-medium">{data.count}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
