import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useMetricHistoricalData } from '../hooks/useQueries';
import { MetricType } from '../backend';

interface MetricChartProps {
  metricType: MetricType;
}

export default function MetricChart({ metricType }: MetricChartProps) {
  const { data: historicalData, isLoading, isError } = useMetricHistoricalData(metricType);

  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    
    return historicalData.map(point => ({
      timestamp: Number(point.timestamp) / 1000000,
      value: point.value,
    }));
  }, [historicalData]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatValue = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(2);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp);
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">
            {date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatValue(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-[150px] w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="py-2">
        <AlertCircle className="h-3 w-3" />
        <AlertDescription className="text-xs">
          Failed to load historical data
        </AlertDescription>
      </Alert>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[150px] text-xs text-muted-foreground">
        No historical data available
      </div>
    );
  }

  return (
    <div className="w-full h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--dashboard-blue))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--dashboard-blue))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            vertical={false}
            opacity={0.3}
          />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={formatValue}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--dashboard-blue))"
            strokeWidth={2}
            fill={`url(#gradient-${metricType})`}
            isAnimationActive={true}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
