'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function ChartStyle({ id, config }: { id: string, config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, itemConfig]) => itemConfig.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: colorConfig
          .map(([key, itemConfig]) => {
            return `[data-chart="${id}"] { --color-${key}: ${itemConfig.color}; }`
          })
          .join('\n'),
      }}
    />
  )
}

function ChartContainer({
  id,
  className,
  children,
  config,
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-reference-line_line]:stroke-border [&_.recharts-sector[stroke="#fff"]]:stroke-transparent [&_.recharts-dot[stroke="#fff"]]:stroke-transparent [&_.recharts-layer]:outline-none',
          className,
        )}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
  indicator = 'dot',
  formatter,
  label,
  labelFormatter,
  nameKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  hideLabel?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  nameKey?: string
}) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${nameKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = config[key]
    const value = itemConfig?.label || label

    if (labelFormatter) {
      return (
        <div className="font-medium">{labelFormatter(value, payload)}</div>
      )
    }

    return <div className="font-medium">{value}</div>
  }, [hideLabel, payload, label, labelFormatter, config, nameKey])

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn('grid min-w-[8rem] gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl', className)}>
      {tooltipLabel}
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`
          const itemConfig = config[key]
          const color = item.payload?.fill || item.color

          return (
            <div key={item.dataKey} className="flex w-full items-center gap-2">
              <div
                className={cn(
                  'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                  indicator === 'dot' && 'h-2.5 w-2.5',
                  indicator === 'line' && 'h-0.5 w-3',
                  indicator === 'dashed' && 'h-0.5 w-3 border border-dashed bg-transparent',
                )}
                style={{
                  '--color-bg': color,
                  '--color-border': color,
                } as React.CSSProperties}
              />
              <div className="flex flex-1 justify-between leading-none">
                <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                <span className="font-mono font-medium text-foreground">
                  {formatter
                    ? formatter(item.value, item.name, item, payload)
                    : item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}