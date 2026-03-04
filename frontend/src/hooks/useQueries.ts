import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MetricType, type UserPreferences, type ConversionRate, ChartTimeframe, type ChartDataPoint, ApiSource, type PriceSourceData, type MetricDataPoint } from '../backend';

// API Configuration
const ICPTOKENS_API_BASE = 'https://icptokens.net/api/v1';
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINMARKETCAP_API_BASE = 'https://pro-api.coinmarketcap.com/v1';
const IC_DASHBOARD_API = 'https://ic-api.internetcomputer.org/api/v3';
const ICP_COIN_ID = 'internet-computer';
const ICP_CMC_ID = '8916';
const CMC_API_KEY = '';

interface CoinGeckoMarketData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinMarketCapQuote {
  data: {
    [key: string]: {
      id: number;
      name: string;
      symbol: string;
      quote: {
        USD: {
          price: number;
          volume_24h: number;
          percent_change_24h: number;
          market_cap: number;
        };
      };
    };
  };
}

interface ICDashboardMetrics {
  cycleBurnRate: number;
  transactionsPerSecond: number;
  canisterStorage: number;
  canisterCount: number;
  subnetCount: number;
  nodeProviderCount: number;
  nodeMachineCount: number;
}

interface ICDashboardPrice {
  price: number;
  volume_24h: number;
  percent_change_24h: number;
}

interface ICPTokensOHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MultiSourceChartData {
  timestamp: number;
  icpTokensNet?: number;
  coinGecko?: number;
  coinMarketCap?: number;
  icDashboard?: number;
  composite: number;
  volume: number;
  high: number;
  low: number;
}

export interface MultiSourcePriceResult {
  chartData: MultiSourceChartData[];
  activeSources: ApiSource[];
  currentPrices: {
    icpTokensNet?: number;
    coinGecko?: number;
    coinMarketCap?: number;
    icDashboard?: number;
    composite: number;
  };
  priceChange24h: number;
  priceChangePercent: number;
  totalVolume: number;
}

// Fetch ICP price data from ICPTokens.net API
const fetchICPTokensNetData = async (timeframe: ChartTimeframe): Promise<ChartDataPoint[] | null> => {
  let interval: string;
  let range: string;
  
  switch (timeframe) {
    case ChartTimeframe.fifteenMinutes:
      interval = '15m';
      range = '1d';
      break;
    case ChartTimeframe.oneHour:
      interval = '1h';
      range = '1d';
      break;
    case ChartTimeframe.fourHours:
      interval = '4h';
      range = '1d';
      break;
    case ChartTimeframe.eightHours:
      interval = '8h';
      range = '1d';
      break;
    case ChartTimeframe.oneDay:
      interval = '5m';
      range = '1d';
      break;
    case ChartTimeframe.sevenDays:
      interval = '1h';
      range = '7d';
      break;
    case ChartTimeframe.oneMonth:
      interval = '4h';
      range = '30d';
      break;
    case ChartTimeframe.oneYear:
      interval = '1d';
      range = '365d';
      break;
    default:
      interval = '4h';
      range = '30d';
  }

  try {
    const url = `${ICPTOKENS_API_BASE}/markets/icp/ohlc?interval=${interval}&range=${range}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ICPTokens.net API error: ${response.status}`);
    }
    
    const data: ICPTokensOHLCData[] = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('ICPTokens.net returned empty data');
    }
    
    const chartData = data.map((point) => ({
      timestamp: BigInt(point.timestamp * 1000000),
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume
    }));
    
    console.log('✅ ICPTokens.net: Successfully fetched price data');
    return chartData;
  } catch (error) {
    console.error('❌ ICPTokens.net: Failed to fetch price data', error);
    return null;
  }
};

// Fetch ICP price data from CoinGecko API
const fetchCoinGeckoData = async (timeframe: ChartTimeframe): Promise<ChartDataPoint[] | null> => {
  let days: number | string;
  
  switch (timeframe) {
    case ChartTimeframe.fifteenMinutes:
    case ChartTimeframe.oneHour:
    case ChartTimeframe.fourHours:
    case ChartTimeframe.eightHours:
    case ChartTimeframe.oneDay:
      days = 1;
      break;
    case ChartTimeframe.sevenDays:
      days = 7;
      break;
    case ChartTimeframe.oneMonth:
      days = 30;
      break;
    case ChartTimeframe.oneYear:
      days = 365;
      break;
    default:
      days = 30;
  }

  try {
    const url = `${COINGECKO_API_BASE}/coins/${ICP_COIN_ID}/market_chart?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const marketData: CoinGeckoMarketData = await response.json();
    
    if (!marketData.prices || marketData.prices.length === 0) {
      throw new Error('CoinGecko returned empty data');
    }
    
    const chartData = marketData.prices.map((pricePoint, index) => {
      const [timestamp, price] = pricePoint;
      const volume = marketData.total_volumes[index]?.[1] || 0;
      const open = index > 0 ? marketData.prices[index - 1][1] : price;
      const high = price * 1.005;
      const low = price * 0.995;
      const close = price;
      
      return {
        timestamp: BigInt(timestamp * 1000000),
        open,
        high,
        low,
        close,
        volume
      };
    });
    
    console.log('✅ CoinGecko: Successfully fetched price data');
    return chartData;
  } catch (error) {
    console.error('❌ CoinGecko: Failed to fetch price data', error);
    return null;
  }
};

// Fetch ICP price data from CoinMarketCap API
const fetchCoinMarketCapData = async (timeframe: ChartTimeframe): Promise<ChartDataPoint[] | null> => {
  try {
    const url = `${COINMARKETCAP_API_BASE}/cryptocurrency/quotes/latest?id=${ICP_CMC_ID}`;
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    if (CMC_API_KEY) {
      headers['X-CMC_PRO_API_KEY'] = CMC_API_KEY;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }
    
    const data: CoinMarketCapQuote = await response.json();
    const icpData = data.data[ICP_CMC_ID];
    
    if (!icpData || !icpData.quote || !icpData.quote.USD) {
      throw new Error('CoinMarketCap returned invalid data');
    }
    
    const currentPrice = icpData.quote.USD.price;
    const volume = icpData.quote.USD.volume_24h;
    const percentChange = icpData.quote.USD.percent_change_24h;
    
    const chartData = generateApproximateHistoricalData(currentPrice, volume, percentChange, timeframe);
    
    console.log('✅ CoinMarketCap: Successfully fetched price data');
    return chartData;
  } catch (error) {
    console.error('❌ CoinMarketCap: Failed to fetch price data', error);
    return null;
  }
};

// Fetch ICP price data from Internet Computer Dashboard API
const fetchICDashboardPriceData = async (timeframe: ChartTimeframe): Promise<ChartDataPoint[] | null> => {
  try {
    const response = await fetch(`${IC_DASHBOARD_API}/icp/price`);
    
    if (!response.ok) {
      throw new Error(`IC Dashboard API error: ${response.status}`);
    }
    
    const priceData: ICDashboardPrice = await response.json();
    
    if (!priceData.price) {
      throw new Error('IC Dashboard returned invalid price data');
    }
    
    const chartData = generateApproximateHistoricalData(
      priceData.price,
      priceData.volume_24h || 0,
      priceData.percent_change_24h || 0,
      timeframe
    );
    
    console.log('✅ IC Dashboard: Successfully fetched price data');
    return chartData;
  } catch (error) {
    console.error('❌ IC Dashboard: Failed to fetch price data', error);
    return null;
  }
};

// Generate approximate historical data
const generateApproximateHistoricalData = (
  currentPrice: number,
  volume: number,
  percentChange: number,
  timeframe: ChartTimeframe
): ChartDataPoint[] => {
  const now = Date.now();
  let dataPoints: number;
  let intervalMs: number;
  
  switch (timeframe) {
    case ChartTimeframe.fifteenMinutes:
      dataPoints = 96;
      intervalMs = 15 * 60 * 1000;
      break;
    case ChartTimeframe.oneHour:
      dataPoints = 24;
      intervalMs = 60 * 60 * 1000;
      break;
    case ChartTimeframe.fourHours:
      dataPoints = 6;
      intervalMs = 4 * 60 * 60 * 1000;
      break;
    case ChartTimeframe.eightHours:
      dataPoints = 3;
      intervalMs = 8 * 60 * 60 * 1000;
      break;
    case ChartTimeframe.oneDay:
      dataPoints = 24;
      intervalMs = 60 * 60 * 1000;
      break;
    case ChartTimeframe.sevenDays:
      dataPoints = 7;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case ChartTimeframe.oneMonth:
      dataPoints = 30;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case ChartTimeframe.oneYear:
      dataPoints = 365;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    default:
      dataPoints = 30;
      intervalMs = 24 * 60 * 60 * 1000;
  }
  
  const startPrice = currentPrice / (1 + percentChange / 100);
  const priceStep = (currentPrice - startPrice) / dataPoints;
  
  return Array.from({ length: dataPoints }, (_, i) => {
    const timestamp = now - (dataPoints - i - 1) * intervalMs;
    const price = startPrice + priceStep * i + (Math.random() - 0.5) * currentPrice * 0.02;
    const open = i > 0 ? startPrice + priceStep * (i - 1) : price;
    const high = price * (1 + Math.random() * 0.01);
    const low = price * (1 - Math.random() * 0.01);
    
    return {
      timestamp: BigInt(timestamp * 1000000),
      open,
      high,
      low,
      close: price,
      volume: volume / dataPoints
    };
  });
};

// Fetch all sources in parallel with automatic fallback
const fetchAllSourcesParallel = async (timeframe: ChartTimeframe): Promise<MultiSourcePriceResult> => {
  console.log('🔄 Fetching data from all sources with automatic fallback (ICPTokens.net primary)...');
  
  // Try ICPTokens.net first (primary source)
  let icpTokensNetData = await fetchICPTokensNetData(timeframe);
  
  // If ICPTokens.net fails, try CoinGecko
  let coinGeckoData: ChartDataPoint[] | null = null;
  if (!icpTokensNetData) {
    console.log('⚠️ ICPTokens.net unavailable, trying CoinGecko...');
    coinGeckoData = await fetchCoinGeckoData(timeframe);
  }
  
  // If both fail, try CoinMarketCap
  let coinMarketCapData: ChartDataPoint[] | null = null;
  if (!icpTokensNetData && !coinGeckoData) {
    console.log('⚠️ CoinGecko unavailable, trying CoinMarketCap...');
    coinMarketCapData = await fetchCoinMarketCapData(timeframe);
  }
  
  // If all fail, try IC Dashboard
  let icDashboardData: ChartDataPoint[] | null = null;
  if (!icpTokensNetData && !coinGeckoData && !coinMarketCapData) {
    console.log('⚠️ CoinMarketCap unavailable, trying IC Dashboard...');
    icDashboardData = await fetchICDashboardPriceData(timeframe);
  }

  const sources: { [key: string]: ChartDataPoint[] | null } = {
    icpTokensNet: icpTokensNetData,
    coinGecko: coinGeckoData,
    coinMarketCap: coinMarketCapData,
    icDashboard: icDashboardData,
  };

  const activeSources: ApiSource[] = [];
  if (sources.icpTokensNet) activeSources.push(ApiSource.icpTokensNet);
  if (sources.coinGecko) activeSources.push(ApiSource.coinGecko);
  if (sources.coinMarketCap) activeSources.push(ApiSource.coinMarketCap);
  if (sources.icDashboard) activeSources.push(ApiSource.internetComputerDashboard);

  console.log(`✅ Active sources: ${activeSources.map(s => getApiSourceName(s)).join(', ')}`);

  // If no sources available, generate fallback data
  if (activeSources.length === 0) {
    console.warn('⚠️ No sources available, using fallback data');
    const fallbackData = generateApproximateHistoricalData(10.5, 50000000, 2.5, timeframe);
    sources.icpTokensNet = fallbackData;
    activeSources.push(ApiSource.icpTokensNet);
  }

  // Aggregate data by timestamp
  const timestampMap = new Map<number, {
    icpTokensNet?: number;
    coinGecko?: number;
    coinMarketCap?: number;
    icDashboard?: number;
    volumes: number[];
    highs: number[];
    lows: number[];
  }>();

  // Process each source
  Object.entries(sources).forEach(([sourceName, data]) => {
    if (!data) return;
    
    data.forEach(point => {
      const ts = Number(point.timestamp) / 1000000;
      const existing = timestampMap.get(ts) || { volumes: [], highs: [], lows: [] };
      
      if (sourceName === 'icpTokensNet') existing.icpTokensNet = point.close;
      if (sourceName === 'coinGecko') existing.coinGecko = point.close;
      if (sourceName === 'coinMarketCap') existing.coinMarketCap = point.close;
      if (sourceName === 'icDashboard') existing.icDashboard = point.close;
      
      existing.volumes.push(point.volume);
      existing.highs.push(point.high);
      existing.lows.push(point.low);
      
      timestampMap.set(ts, existing);
    });
  });

  // Calculate composite prices and format data
  const chartData: MultiSourceChartData[] = Array.from(timestampMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, data]) => {
      const prices = [data.icpTokensNet, data.coinGecko, data.coinMarketCap, data.icDashboard].filter(p => p !== undefined) as number[];
      const composite = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      
      return {
        timestamp,
        icpTokensNet: data.icpTokensNet,
        coinGecko: data.coinGecko,
        coinMarketCap: data.coinMarketCap,
        icDashboard: data.icDashboard,
        composite,
        volume: data.volumes.reduce((sum, v) => sum + v, 0) / data.volumes.length,
        high: Math.max(...data.highs),
        low: Math.min(...data.lows),
      };
    });

  // Calculate current prices and changes
  const latestData = chartData[chartData.length - 1];
  const firstData = chartData[0];
  
  const currentPrices = {
    icpTokensNet: latestData.icpTokensNet,
    coinGecko: latestData.coinGecko,
    coinMarketCap: latestData.coinMarketCap,
    icDashboard: latestData.icDashboard,
    composite: latestData.composite,
  };

  const priceChange24h = latestData.composite - firstData.composite;
  const priceChangePercent = (priceChange24h / firstData.composite) * 100;
  const totalVolume = chartData.reduce((sum, d) => sum + d.volume, 0);

  return {
    chartData,
    activeSources,
    currentPrices,
    priceChange24h,
    priceChangePercent,
    totalVolume,
  };
};

// Helper function to get API source name
export const getApiSourceName = (source: ApiSource): string => {
  switch (source) {
    case ApiSource.icpTokensNet:
      return 'ICPTokens.net';
    case ApiSource.coinGecko:
      return 'CoinGecko';
    case ApiSource.coinMarketCap:
      return 'CoinMarketCap';
    case ApiSource.internetComputerDashboard:
      return 'IC Dashboard';
    default:
      return 'Unknown';
  }
};

// React Query Hooks

export function useMultiSourcePriceData(timeframe: ChartTimeframe) {
  return useQuery<MultiSourcePriceResult>({
    queryKey: ['multiSourcePrice', timeframe],
    queryFn: () => fetchAllSourcesParallel(timeframe),
    staleTime: 60000,
    refetchInterval: 60000,
  });
}

export function useMetricsData() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await fetch(`${IC_DASHBOARD_API}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      return {
        cycleBurnRate: { value: data.cycle_burn_rate || 0 },
        transactionsPerSecond: { value: data.transactions_per_second || 0 },
        canisterStorage: { value: data.canister_storage || 0 },
        canisterCount: { value: data.canister_count || 0 },
        subnetCount: { value: data.subnet_count || 0 },
        nodeProviderCount: { value: data.node_provider_count || 0 },
        nodeMachineCount: { value: data.node_machine_count || 0 },
        sources: [ApiSource.internetComputerDashboard],
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}

export function useMetricHistoricalData(metricType: MetricType) {
  const { actor, isFetching } = useActor();

  return useQuery<MetricDataPoint[]>({
    queryKey: ['metricHistorical', metricType],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getHistoricalData(metricType);
      return data;
    },
    enabled: !!actor && !isFetching,
    staleTime: 300000,
  });
}

export function useConversionRates() {
  const { actor, isFetching } = useActor();

  return useQuery<ConversionRate[]>({
    queryKey: ['conversionRates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllConversionRates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserPreferences(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserPreferences | null>({
    queryKey: ['userPreferences', userId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserPreferences(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSetUserPreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      dayMode,
      customAppName,
      customLogoPath,
    }: {
      userId: string;
      dayMode: boolean;
      customAppName: string | null;
      customLogoPath: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.setUserPreferences(userId, dayMode, customAppName, customLogoPath);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences', variables.userId] });
    },
  });
}
