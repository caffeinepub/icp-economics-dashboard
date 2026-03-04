import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, ExternalLink, ZoomOut, Maximize2 } from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid,
  ReferenceArea
} from 'recharts';
import { useMultiSourcePriceData, getApiSourceName } from '../hooks/useQueries';
import { ChartTimeframe } from '../backend';

const timeframeOptions = [
  { label: '15m', value: ChartTimeframe.fifteenMinutes },
  { label: '1h', value: ChartTimeframe.oneHour },
  { label: '4h', value: ChartTimeframe.fourHours },
  { label: '8h', value: ChartTimeframe.eightHours },
  { label: '1w', value: ChartTimeframe.sevenDays },
  { label: '1m', value: ChartTimeframe.oneMonth },
  { label: '1y', value: ChartTimeframe.oneYear },
];

interface CandlestickShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: any;
  index?: number;
}

const CandlestickShape = (props: CandlestickShapeProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  
  if (!payload || !payload.open || !payload.close || !payload.high || !payload.low) {
    return null;
  }

  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#22c55e' : '#ef4444';
  
  // Calculate dimensions
  const candleWidth = Math.max(width * 0.7, 2);
  const wickWidth = Math.max(width * 0.15, 1);
  const centerX = x + width / 2;
  
  // Price range for the entire chart
  const priceRange = high - low;
  if (priceRange === 0) return null;
  
  // Calculate pixel positions
  const chartHeight = height;
  const pixelPerPrice = chartHeight / priceRange;
  
  const highY = y;
  const lowY = y + chartHeight;
  const openY = y + (high - open) * pixelPerPrice;
  const closeY = y + (high - close) * pixelPerPrice;
  
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1);

  return (
    <g>
      {/* Upper wick */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={bodyTop}
        stroke={color}
        strokeWidth={wickWidth}
      />
      {/* Candle body */}
      <rect
        x={centerX - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
      {/* Lower wick */}
      <line
        x1={centerX}
        y1={bodyBottom}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
    </g>
  );
};

export default function ICPPriceChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>(ChartTimeframe.oneHour);
  const [zoomState, setZoomState] = useState<{ left?: string; right?: string } | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string>('');
  const [refAreaRight, setRefAreaRight] = useState<string>('');
  const [hoveredData, setHoveredData] = useState<any>(null);
  
  const { data: priceResult, isLoading, isError, error } = useMultiSourcePriceData(selectedTimeframe);

  const chartData = priceResult?.chartData || [];
  const currentPrice = priceResult?.currentPrices?.composite || 0;
  const priceChange24h = priceResult?.priceChange24h || 0;
  const totalVolume = priceResult?.totalVolume || 0;
  const activeSources = priceResult?.activeSources || [];

  // Calculate additional metrics
  const marketCap = currentPrice * 540696636;
  const volume24h = totalVolume / (chartData.length || 1);
  const volume7d = totalVolume;

  // Format chart data with OHLC
  const formattedChartData = useMemo(() => {
    return chartData.map((point, index) => {
      const prevPoint = index > 0 ? chartData[index - 1] : point;
      const open = prevPoint.composite;
      const close = point.composite;
      const high = Math.max(open, close, point.high);
      const low = Math.min(open, close, point.low);
      
      return {
        timestamp: point.timestamp,
        timestampStr: new Date(point.timestamp).toISOString(),
        open,
        high,
        low,
        close,
        volume: point.volume,
        composite: point.composite,
      };
    });
  }, [chartData]);

  // Apply zoom if active
  const displayData = useMemo(() => {
    if (!zoomState || !zoomState.left || !zoomState.right) {
      return formattedChartData;
    }
    
    const leftIndex = formattedChartData.findIndex(d => d.timestampStr === zoomState.left);
    const rightIndex = formattedChartData.findIndex(d => d.timestampStr === zoomState.right);
    
    if (leftIndex === -1 || rightIndex === -1) return formattedChartData;
    
    return formattedChartData.slice(
      Math.min(leftIndex, rightIndex),
      Math.max(leftIndex, rightIndex) + 1
    );
  }, [formattedChartData, zoomState]);

  // Calculate percentage changes
  const calculateChange = (days: number) => {
    if (formattedChartData.length < 2) return 0;
    const dataPoints = Math.min(days, formattedChartData.length);
    const oldPrice = formattedChartData[formattedChartData.length - dataPoints]?.close || currentPrice;
    return ((currentPrice - oldPrice) / oldPrice) * 100;
  };

  const change24h = calculateChange(1);
  const change7d = calculateChange(7);
  const change30d = calculateChange(30);
  const change90d = calculateChange(90);

  // Format timestamp for X-axis based on timeframe
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    
    switch (selectedTimeframe) {
      case ChartTimeframe.fifteenMinutes:
      case ChartTimeframe.oneHour:
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      case ChartTimeframe.fourHours:
      case ChartTimeframe.eightHours:
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', hour12: false });
      case ChartTimeframe.sevenDays:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case ChartTimeframe.oneMonth:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case ChartTimeframe.oneYear:
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp);
      
      return (
        <div className="bg-black/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-zinc-400 mb-2">
            {date.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">O:</span>
              <span className="text-white font-medium">${data.open?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">H:</span>
              <span className="text-green-500 font-medium">${data.high?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">L:</span>
              <span className="text-red-500 font-medium">${data.low?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">C:</span>
              <span className="text-white font-medium">${data.close?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-zinc-700">
              <span className="text-zinc-400">Vol:</span>
              <span className="text-white font-medium">{formatNumber(data.volume)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const displayOHLC = hoveredData || (formattedChartData.length > 0 ? formattedChartData[formattedChartData.length - 1] : null);

  // Zoom handlers
  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  };

  const handleMouseMove = (e: any) => {
    if (refAreaLeft && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
    if (e && e.activePayload && e.activePayload[0]) {
      setHoveredData(e.activePayload[0].payload);
    }
  };

  const handleMouseUp = () => {
    if (refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight) {
      setZoomState({ left: refAreaLeft, right: refAreaRight });
    }
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const handleZoomOut = () => {
    setZoomState(null);
  };

  const handleZoomReset = () => {
    setZoomState(null);
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  // Get primary source name
  const primarySource = activeSources.length > 0 ? getApiSourceName(activeSources[0]) : 'Unknown';

  return (
    <Card className="w-full shadow-2xl border-0 bg-black overflow-hidden">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left: Title and Price Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">∞</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Internet Computer (ICP)</h2>
                  <p className="text-xs text-zinc-500">ICPUSD</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-baseline gap-4 mb-3">
                <span className="text-3xl font-bold text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className={`flex items-center gap-1 font-semibold ${
                    change24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}% (24h)</span>
                  </div>
                  <div className={`${change7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change7d >= 0 ? '+' : ''}{change7d.toFixed(2)}% (7d)
                  </div>
                  <div className={`${change30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change30d >= 0 ? '+' : ''}{change30d.toFixed(2)}% (30d)
                  </div>
                  <div className={`${change90d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change90d >= 0 ? '+' : ''}{change90d.toFixed(2)}% (90d)
                  </div>
                </div>
              </div>

              {/* OHLC Display */}
              {displayOHLC && (
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">O</span>
                    <span className="text-zinc-300 font-medium">${displayOHLC.open.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">H</span>
                    <span className="text-green-500 font-medium">${displayOHLC.high.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">L</span>
                    <span className="text-red-500 font-medium">${displayOHLC.low.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">C</span>
                    <span className="text-zinc-300 font-medium">${displayOHLC.close.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Key Metrics Panel */}
            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3 min-w-[280px]">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Fully Diluted Market Cap</span>
                <span className="text-sm text-white font-medium">{formatNumber(marketCap)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Volume (24h)</span>
                <span className="text-sm text-white font-medium">{formatNumber(volume24h)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Volume (7d)</span>
                <span className="text-sm text-white font-medium">{formatNumber(volume7d)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total Supply</span>
                <span className="text-sm text-white font-medium">540,696,636 ICP</span>
              </div>
              <div className="border-t border-zinc-700 pt-3 space-y-2">
                <div className="text-xs text-zinc-400 mb-2">Data Source</div>
                <div className="text-xs text-blue-400 font-medium">{primarySource}</div>
              </div>
            </div>
          </div>

          {/* Timeframe selector and zoom controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {timeframeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTimeframe(option.value);
                    handleZoomReset();
                  }}
                  className={`h-8 px-3 text-xs font-medium whitespace-nowrap transition-all ${
                    selectedTimeframe === option.value 
                      ? 'bg-zinc-700 text-white hover:bg-zinc-600' 
                      : 'bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            {/* Zoom controls */}
            <div className="flex gap-2">
              {zoomState && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-8 px-3 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  <ZoomOut className="h-3 w-3 mr-1" />
                  Zoom Out
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                className="h-8 px-3 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {isError && (
          <Alert variant="destructive" className="m-4 bg-red-950 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load chart data. {error instanceof Error ? error.message : 'Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Chart Section */}
        <div className="bg-black p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500/30 border-t-blue-500"></div>
                <p className="text-sm text-zinc-400">Loading chart...</p>
              </div>
            </div>
          ) : displayData.length > 0 ? (
            <div className="space-y-2">
              {/* Price Chart with Candlesticks */}
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={displayData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#27272a" 
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatXAxis}
                      stroke="#71717a"
                      tick={{ fill: '#a1a1aa', fontSize: 11 }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                      minTickGap={50}
                    />
                    <YAxis 
                      yAxisId="price"
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                      stroke="#71717a"
                      tick={{ fill: '#a1a1aa', fontSize: 11 }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Candlestick bars */}
                    <Bar
                      yAxisId="price"
                      dataKey="high"
                      shape={<CandlestickShape />}
                      isAnimationActive={false}
                    />
                    
                    {refAreaLeft && refAreaRight && (
                      <ReferenceArea
                        yAxisId="price"
                        x1={refAreaLeft}
                        x2={refAreaRight}
                        strokeOpacity={0.3}
                        fill="#3b82f6"
                        fillOpacity={0.1}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Volume Chart */}
              <div className="w-full h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={displayData}
                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#27272a" 
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatXAxis}
                      stroke="#71717a"
                      tick={{ fill: '#a1a1aa', fontSize: 10 }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                      minTickGap={50}
                      hide
                    />
                    <YAxis 
                      tickFormatter={(value) => formatNumber(value)}
                      stroke="#71717a"
                      tick={{ fill: '#a1a1aa', fontSize: 10 }}
                      tickLine={{ stroke: '#3f3f46' }}
                      axisLine={{ stroke: '#3f3f46' }}
                      width={60}
                    />
                    <Bar dataKey="volume" fill="url(#volumeGradient)">
                      {displayData.map((entry, index) => {
                        const prevEntry = index > 0 ? displayData[index - 1] : entry;
                        const color = entry.close >= prevEntry.close ? '#22c55e' : '#ef4444';
                        return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.3} />;
                      })}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px]">
              <p className="text-zinc-500">No chart data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
