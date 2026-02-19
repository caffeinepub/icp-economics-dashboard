import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value?: number;
  unit: string;
  source: string;
  isLoading?: boolean;
}

export default function MetricCard({ title, value, unit, source, isLoading }: MetricCardProps) {
  const formatValue = (val?: number) => {
    if (val === undefined) return '--';
    
    if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(2)}K`;
    
    return val.toLocaleString(undefined, { 
      minimumFractionDigits: val < 1 ? 4 : 2,
      maximumFractionDigits: val < 1 ? 4 : 2 
    });
  };

  // Simulate trend (in real app, this would compare with previous value)
  const trend = value ? (Math.random() > 0.5 ? 'up' : 'down') : null;
  const trendPercent = value ? (Math.random() * 5).toFixed(2) : null;

  return (
    <Card className="group hover:shadow-dashboard-lg transition-all duration-300 hover-lift border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm overflow-hidden relative">
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-dashboard-blue/10 border border-dashboard-blue/20">
              <Activity className="h-4 w-4 text-dashboard-blue" />
            </div>
            <span className="tracking-tight">{title}</span>
          </span>
          {trend && trendPercent && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
              trend === 'up' 
                ? 'bg-dashboard-green/15 text-dashboard-green border border-dashboard-green/30' 
                : 'bg-dashboard-red/15 text-dashboard-red border border-dashboard-red/30'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {trendPercent}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-10 w-32 rounded-lg" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {formatValue(value)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">{unit}</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Zap className="h-3.5 w-3.5 text-dashboard-blue/70" />
            <span className="text-xs text-muted-foreground/90 font-medium">
              {source}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
