"use client"

import { Pie, PieChart } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart"

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function PieLegend() {
  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">Pie Chart - Legend</h3>
        <p className="text-sm text-muted-foreground">January - June 2024</p>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer className="aspect-square w-80 h-80" config={chartConfig}>
          <PieChart>
            <Pie data={chartData} dataKey="visitors" />
            <ChartLegend
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              content={props => (
                <ChartLegendContent
                  nameKey="browser"
                  payload={props.payload}
                  verticalAlign={props.verticalAlign}
                />
              )}
            />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  )
}

export default PieLegend
