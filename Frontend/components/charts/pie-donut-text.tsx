"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
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
  count: {
    label: "Số lượng",
  },
  completed: {
    label: "Thành công",
    color: "#10b981", // Emerald 500
  },
  cancelled: {
    label: "Đã hủy",
    color: "#ef4444", // Red 500
  },
} satisfies ChartConfig

interface PieDonutTextProps {
  completed: number;
  cancelled: number;
}

export function PieDonutText({ completed, cancelled }: PieDonutTextProps) {
  const chartData = [
    { status: "completed", count: completed, fill: "#10b981" },
    { status: "cancelled", count: cancelled, fill: "#ef4444" },
  ]

  const totalOrders = React.useMemo(() => {
    return completed + cancelled
  }, [completed, cancelled])

  return (
    <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-black text-gray-900">Tỉ lệ đơn hàng</CardTitle>
        <CardDescription>Thành công vs Đã hủy</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={8}
              stroke="#fff"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        dominantBaseline="middle"
                        textAnchor="middle"
                        x={viewBox.cx}
                        y={viewBox.cy}
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-gray-900 text-3xl font-black"
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-gray-400 text-xs font-bold uppercase tracking-widest"
                        >
                          Đơn hàng
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default PieDonutText
