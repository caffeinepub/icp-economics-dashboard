import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import MetricCard from './MetricCard';
import ConversionRateTable from './ConversionRateTable';
import ICPPriceChart from './ICPPriceChart';
import { useMetricsData, getApiSourceName } from '../hooks/useQueries';
import { MetricType } from '../backend';

export default function Dashboard() {
  const { data: metricsData, isLoading, isError, error } = useMetricsData();

  const apiSources = metricsData?.sources ? metricsData.sources.map(s => getApiSourceName(s)).join(', ') : 'Unknown';

  const metrics = [
    {
      title: 'Cycle Burn Rate',
      type: MetricType.cycleBurnRate,
      value: metricsData?.cycleBurnRate?.value,
      unit: 'cycles/sec',
      source: apiSources
    },
    {
      title: 'Transactions Per Second',
      type: MetricType.transactionsPerSecond,
      value: metricsData?.transactionsPerSecond?.value,
      unit: 'TPS',
      source: apiSources
    },
    {
      title: 'Total Canister Storage',
      type: MetricType.canisterStorage,
      value: metricsData?.canisterStorage?.value,
      unit: 'TiB',
      source: apiSources
    },
    {
      title: 'Canister Count',
      type: MetricType.canisterCount,
      value: metricsData?.canisterCount?.value,
      unit: 'canisters',
      source: apiSources
    },
    {
      title: 'Subnet Count',
      type: MetricType.subnetCount,
      value: metricsData?.subnetCount?.value,
      unit: 'subnets',
      source: apiSources
    },
    {
      title: 'Node Provider Count',
      type: MetricType.nodeProviderCount,
      value: metricsData?.nodeProviderCount?.value,
      unit: 'providers',
      source: apiSources
    },
    {
      title: 'Node Machine Count',
      type: MetricType.nodeMachineCount,
      value: metricsData?.nodeMachineCount?.value,
      unit: 'machines',
      source: apiSources
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="font-medium">
            Failed to load dashboard data. {error instanceof Error ? error.message : 'Please check your connection and try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* ICP Price Chart */}
      <div className="animate-fade-in">
        <ICPPriceChart />
      </div>

      {/* Metrics Grid */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Real-time Network Metrics</h2>
          <p className="text-sm text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dashboard-green animate-pulse"></span>
              Aggregated data from {apiSources}
            </span>
            <span className="mx-2">•</span>
            Updates every minute
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {metrics.map((metric, index) => (
            <div 
              key={metric.type} 
              className="animate-fade-in"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <MetricCard
                title={metric.title}
                type={metric.type}
                value={metric.value}
                unit={metric.unit}
                source={metric.source}
                isLoading={isLoading}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ICP/Cycles Conversion Rate Table */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <ConversionRateTable />
      </div>
    </div>
  );
}
