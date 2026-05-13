"use client"

import { useMemo } from "react"
import { Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTaskStore, getUserById } from "@/lib/store/task-store"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  backlog: "#8b5cf6",
  todo: "#6b7280",
  "in-progress": "#3b82f6",
  review: "#a78bfa",
  done: "#10b981",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "#64748b",
  medium: "#3b82f6",
  high: "#f59e0b",
  urgent: "#ef4444",
}

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

const statusChartConfig = {
  backlog: { label: "Backlog", color: STATUS_COLORS.backlog },
  todo: { label: "To Do", color: STATUS_COLORS.todo },
  "in-progress": { label: "In Progress", color: STATUS_COLORS["in-progress"] },
  review: { label: "Review", color: STATUS_COLORS.review },
  done: { label: "Done", color: STATUS_COLORS.done },
}

const priorityChartConfig = {
  low: { label: "Low", color: PRIORITY_COLORS.low },
  medium: { label: "Medium", color: PRIORITY_COLORS.medium },
  high: { label: "High", color: PRIORITY_COLORS.high },
  urgent: { label: "Urgent", color: PRIORITY_COLORS.urgent },
}

function CustomLegend({ data, colors, labels }: { data: { name: string; value: number }[]; colors: Record<string, string>; labels: Record<string, string> }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-3">
      {data.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5 text-nowrap">
          <div
            className="size-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: colors[entry.name] }}
          />
          <span className="text-xs text-muted-foreground">{labels[entry.name] || entry.name}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardCharts() {
  const tasks = useTaskStore((s) => s.tasks)
  const users = useTaskStore((s) => s.users)

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] || 0) + 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tasks) {
      counts[t.priority] = (counts[t.priority] || 0) + 1
    }
    const order = ["urgent", "high", "medium", "low"]
    return order.filter((k) => counts[k]).map((name) => ({ name, value: counts[name] }))
  }, [tasks])

  const userTaskData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tasks) {
      if (t.assigneeId) {
        counts[t.assigneeId] = (counts[t.assigneeId] || 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([id, value]) => ({
        name: getUserById(users, id)?.name || "Unassigned",
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [tasks, users])

  if (tasks.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" />} />
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} strokeWidth={2}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={`var(--color-${entry.name})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <CustomLegend data={statusData} colors={STATUS_COLORS} labels={STATUS_LABELS} />
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={priorityChartConfig} className="aspect-auto h-[300px]">
            <BarChart data={priorityData} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => PRIORITY_LABELS[v] || v}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted)/30)" }}
                content={<ChartTooltipContent nameKey="name" />}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={`var(--color-${entry.name})`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <CustomLegend data={priorityData} colors={PRIORITY_COLORS} labels={PRIORITY_LABELS} />
        </CardContent>
      </Card>

      {userTaskData.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Tasks per Member</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ user: { label: "Tasks", color: "hsl(var(--primary))" } }}
              className="aspect-auto h-[250px]"
            >
              <BarChart data={userTaskData} layout="vertical" barCategoryGap="20%">
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={150}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip cursor={{ fill: "hsl(var(--muted)/30)" }} content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={32} fill="var(--color-user)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
