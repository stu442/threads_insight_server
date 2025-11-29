"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getCurrentUser, getTagCorrelation, TagCorrelation } from "@/lib/api"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const LEN_TAG_LABEL = "Length-based Tags (len-*)";

export function TagCorrelationChart() {
    const [data, setData] = useState<TagCorrelation[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTags, setSelectedTags] = useState<string[]>([LEN_TAG_LABEL])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const me = await getCurrentUser()
                const result = await getTagCorrelation(me.threadsUserId)
                setData(result)
            } catch (error) {
                console.error("Failed to fetch tag correlation", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Extract available tags for the dropdown
    const availableTags = useMemo(() => {
        const tags = new Set<string>()
        let hasLenTags = false

        data.forEach(item => {
            if (item.tag.startsWith('len-')) {
                hasLenTags = true
            } else {
                tags.add(item.tag)
            }
        })

        const sortedTags = Array.from(tags).sort()
        if (hasLenTags) {
            return [LEN_TAG_LABEL, ...sortedTags]
        }
        return sortedTags
    }, [data])

    // Filter data based on selection
    const filteredData = useMemo(() => {
        if (selectedTags.length === 0) return data

        return data.filter(item => {
            if (item.tag.startsWith('len-')) {
                return selectedTags.includes(LEN_TAG_LABEL)
            }
            return selectedTags.includes(item.tag)
        })
    }, [data, selectedTags])

    const toggleTag = (tag: string) => {
        setSelectedTags(current =>
            current.includes(tag)
                ? current.filter(t => t !== tag)
                : [...current, tag]
        )
    }

    const allSelected = selectedTags.length === availableTags.length && availableTags.length > 0
    const selectAllTags = () => {
        setSelectedTags(current => {
            if (availableTags.length === 0) return current
            return current.length === availableTags.length ? [] : availableTags
        })
    }

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
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Tag Correlation Analysis</CardTitle>
                        <CardDescription>태그별 평균 지표 (조회수 대비 좋아요/댓글)</CardDescription>
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[250px] justify-between"
                            >
                                {selectedTags.length > 0
                                    ? `${selectedTags.length} tags selected`
                                    : "Select tags..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                            <Command>
                                <CommandInput placeholder="Search tags..." />
                                <CommandList>
                                    <CommandEmpty>No tag found.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            value="__select_all"
                                            onSelect={selectAllTags}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    allSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            Select all tags
                                        </CommandItem>
                                        {availableTags.map((tag) => (
                                            <CommandItem
                                                key={tag}
                                                value={tag}
                                                onSelect={() => toggleTag(tag)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {tag}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                                {tag}
                                <X className="ml-1 h-3 w-3" />
                            </Badge>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-xs"
                            onClick={() => setSelectedTags([])}
                        >
                            Clear all
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={filteredData}>
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                                            <p className="font-medium mb-2">{label}</p>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    <span className="text-muted-foreground">Posts:</span>
                                                    <span className="font-medium ml-auto">{data.count}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                                                    <span className="text-muted-foreground">Avg Views:</span>
                                                    <span className="font-medium ml-auto">{data.avgViews.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[hsl(142,76%,36%)]" />
                                                    <span className="text-muted-foreground">Avg Likes:</span>
                                                    <span className="font-medium ml-auto">{data.avgLikes.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[hsl(221,83%,53%)]" />
                                                    <span className="text-muted-foreground">Avg Replies:</span>
                                                    <span className="font-medium ml-auto">{data.avgReplies.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
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
