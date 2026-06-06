"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "#3b82f6", // Blue 500
  },
} satisfies ChartConfig

interface BarSimpleProps {
  data: { month: string; revenue: number }[];
}

export function BarSimple({ data }: BarSimpleProps) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 h-full flex flex-col">
      <CardHeader className="px-2">
        <CardTitle className="text-xl font-black flex items-center gap-2">
           <div className="w-2 h-6 bg-blue-500 rounded-full" />
           Doanh thu theo tháng
        </CardTitle>
        <CardDescription className="font-bold">Tổng quan 12 tháng trong năm</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 mt-6 p-0 min-h-[250px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.replace("Tháng ", "T")}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              hide
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="revenue"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default BarSimple
