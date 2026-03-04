import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useConversionRates } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConversionRateTable() {
  const { data: rates, isLoading, isError, error } = useConversionRates();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatRate = (rate: number) => {
    return rate.toExponential(2);
  };

  // Calculate trend
  const getTrend = (currentRate: number, previousRate?: number) => {
    if (!previousRate) return null;
    const change = ((currentRate - previousRate) / previousRate) * 100;
    return {
      direction: change >= 0 ? 'up' : 'down',
      percent: Math.abs(change).toFixed(2)
    };
  };

  return (
    <Card className="w-full shadow-dashboard-lg border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-dashboard-purple/10 border border-dashboard-purple/20">
              <Calendar className="h-5 w-5 text-dashboard-purple" />
            </div>
            ICP/Cycles Conversion Rates
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
            Historical Data
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Daily conversion rates from September 1st, 2025 to present
        </p>
      </CardHeader>
      <CardContent>
        {isError && (
          <Alert variant="destructive" className="mb-4 border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">
              Failed to load conversion rates. {error instanceof Error ? error.message : 'Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[400px] rounded-xl border-2 border-border/40 bg-gradient-to-br from-muted/20 via-background to-muted/20 shadow-inner">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b-2 border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Rate (ICP to Cycles)</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : rates && rates.length > 0 ? (
                rates
                  .slice()
                  .reverse()
                  .map((rate, index, array) => {
                    const previousRate = array[index + 1]?.rate;
                    const trend = getTrend(rate.rate, previousRate);
                    
                    return (
                      <TableRow 
                        key={rate.date} 
                        className="hover:bg-muted/50 transition-colors border-b border-border/30"
                      >
                        <TableCell className="font-medium text-sm">
                          {formatDate(rate.date)}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold">
                          {formatRate(rate.rate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {trend && (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                              trend.direction === 'up' 
                                ? 'bg-dashboard-green/15 text-dashboard-green border border-dashboard-green/30' 
                                : 'bg-dashboard-red/15 text-dashboard-red border border-dashboard-red/30'
                            }`}>
                              {trend.direction === 'up' ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : (
                                <TrendingDown className="h-3.5 w-3.5" />
                              )}
                              {trend.percent}%
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground font-medium">No conversion rates available</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-dashboard-purple animate-pulse"></span>
              Data Source: Internet Computer Dashboard
            </span>
            <span className="mx-2">•</span>
            Updated daily at 00:00 UTC
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
