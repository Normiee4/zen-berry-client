"use client"

import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useMemo } from "react"

interface DayData {
  date: string
  day: string
  pomodoros: number
  tasks: number
  mits: number
  focusMinutes: number
}

interface HistoryResponse {
  data: DayData[]
  weeklyTotals: {
    pomodoros: number
    tasks: number
    focusMinutes: number
  } | null
  period: string
}

const fetchHistory = async (period: string = "week"): Promise<HistoryResponse> => {
  const res = await fetch(`/api/analytics/history?period=${period}`)
  if (!res.ok) throw new Error("Failed to fetch history")
  return res.json()
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: DayData }> }) => {
  if (!active || !payload?.length) return null
  
  const data = payload[0].payload
  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border/30">
      <p className="text-xs font-medium text-foreground mb-1">{data.day}</p>
      <p className="text-sm text-matcha font-semibold">
        🍅 {data.pomodoros} pomodoro{data.pomodoros !== 1 ? "s" : ""}
      </p>
      <p className="text-xs text-muted-foreground">
        {data.focusMinutes > 0 && `${Math.floor(data.focusMinutes / 60)}h ${data.focusMinutes % 60}m focus`}
      </p>
    </div>
  )
}

export function AnalyticsChart({ period = "week" }: { period?: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-history", period],
    queryFn: () => fetchHistory(period),
    staleTime: 5 * 60 * 1000,
  })

  const chartData = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((d) => ({
      ...d,
      fill: d.pomodoros > 0 ? "#86A788" : "#E5E7EB",
    }))
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-matcha/30 border-t-matcha rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Unable to load chart data
      </div>
    )
  }

  const totals = data?.weeklyTotals

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Weekly Progress</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totals ? `${totals.pomodoros} pomodoros · ${Math.floor(totals.focusMinutes / 60)}h ${totals.focusMinutes % 60}m` : "No data yet"}
          </p>
        </div>
      </div>

      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
              dy={8}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(134, 167, 136, 0.1)" }} />
            <Bar dataKey="pomodoros" radius={[6, 6, 4, 4]} maxBarSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20">
          <div className="text-center">
            <p className="text-lg font-semibold text-matcha">{totals?.pomodoros || 0}</p>
            <p className="text-xs text-muted-foreground">Pomodoros</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-strawberry">{totals?.tasks || 0}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              {totals ? `${Math.floor(totals.focusMinutes / 60)}h` : "0h"}
            </p>
            <p className="text-xs text-muted-foreground">Focus</p>
          </div>
        </div>
      )}
    </div>
  )
}