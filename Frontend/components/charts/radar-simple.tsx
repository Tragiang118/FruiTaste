import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
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
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface RadarSimpleProps {
  data: { month: string; revenue: number }[];
}

export function RadarSimple({ data }: RadarSimpleProps) {
  return (
    <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-black text-gray-900">Phân tích doanh thu năm</CardTitle>
        <CardDescription>Tổng doanh thu 12 tháng qua</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-0 pb-6">
        <ChartContainer className="aspect-square w-full max-h-[350px]" config={chartConfig}>
          <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <PolarAngleAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
            />
            <PolarGrid stroke="hsl(var(--muted))" />
            <Radar 
              name="Doanh thu"
              dataKey="revenue" 
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))" 
              fillOpacity={0.4} 
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default RadarSimple
