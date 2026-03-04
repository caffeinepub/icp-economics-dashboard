# Specification

## Summary
**Goal:** Transform the crypto dashboard into a professional trading platform with real candlestick charts, timeframe selection, and expandable historical charts for all metrics.

**Planned changes:**
- Replace current price chart with professional candlestick chart using real OHLC data from CoinGecko API
- Add timeframe selector with options: 15m, 1h, 4h, 8h, 1w, 1m, 1y
- Add toggle switches to all metric cards (volume, market cap, price changes) to show/hide historical charts below values
- Fetch and cache historical data for each metric to support the expandable charts
- Style candlestick chart with professional trading UI including grid lines, axis labels, and timeline markers
- Add hover tooltips showing detailed OHLC data and timestamps

**User-visible outcome:** Users can view a professional candlestick trading chart with selectable timeframes (15m to 1y), and toggle historical charts for individual metrics (volume, market cap, price changes) to analyze trends over time.
