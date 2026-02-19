# ICP Economics Dashboard

## Overview
A professional trading application displaying real-time ICP blockchain metrics with modern financial dashboard aesthetics. The dashboard is fully responsive across mobile, tablet, and desktop devices with TradingView-inspired design elements.

## Core Features

### ICP Token Price Chart with Professional Candlestick Visualization
- Display a fully functional professional ICP token candlestick chart prominently at the top of the dashboard using TradingView-style design
- Chart features true OHLC candlesticks with accurate timestamps and smooth data transitions over a dark background with subtle grid lines inspired by ICPTokens.net's clean professional look
- Candlestick colors clearly differentiate between up (green) and down (red) candles with proper OHLC rendering
- Transparent volume bars displayed beneath price candles with matching color scheme (green/red based on price movement)
- Primary data source: ICPTokens.net API for accurate ICP OHLC price data and market information
- Automatic fallback system: CoinGecko API as secondary source, then CoinMarketCap API as tertiary source, then Internet Computer Dashboard API as quaternary source
- Professional chart header displaying "Internet Computer (ICP)" ticker title with current price and percentage changes for multiple intervals (24h, 7d, 30d, 90d)
- Interactive chart features including:
  - Zoom functionality for detailed time period analysis
  - Pan controls for navigating historical data
  - Crosshair support with hover tooltips showing precise OHLC data and timestamps
  - Interactive time period selector buttons (1m, 30m, 1h, 1D) styled to match TradingView professional interface
- Side-by-side ICP ecosystem trading metrics panel synchronized with the chart's active timeframe:
  - Volume (24h, 7d) synchronized with selected chart timeframe
  - Fully diluted market cap
  - Total supply
  - Contract links with appropriate icons
- Professional TradingView-like presentation with accurate color palette, spacing, typography, and icons
- Dark-themed chart design with subtle grid lines for clean professional appearance matching ICPTokens.net aesthetic
- Fully responsive design that adapts to all device sizes with proper chart element scaling
- Chart data fetched via frontend HTTP calls with automatic fallback system for live OHLC and volume data
- Real-time price updates with smooth data transitions
- Charts instantly adapt to day/night mode with optimized color schemes for both light and dark themes
- Error handling for chart data fetching with graceful degradation when sources fail
- Display "Source: ICPTokens.net" text below chart indicating the active data source
- Chart updates dynamically when primary source fails while preserving data continuity from fallback sources
- Accurate rendering of all candlestick data, volume bars, labels, and axes without visual clutter or overlap
- OHLC values, timestamps, and percentage changes accurately displayed from the correct data source
- Modern tick labeling and professional grid styling matching ICPTokens.net design standards

### Real-time Metrics Display
- Display current ICP network metrics fetched via frontend HTTP calls:
  - Cycle burn rates (with USD conversion)
  - Transactions per second
  - Total canister storage (TiB)
  - Canister count
  - Subnet count
  - Node provider count
  - Node machine count
- Show specific data source or API endpoint directly below each metric in smaller, subtle font for transparency
- Display "Sources: [Active API names]" text below each metric indicating all active data sources
- Comprehensive error handling for all data fetching operations with graceful degradation
- Clear attribution for every metric showing all contributing data sources
- Real-time updates with smooth data transitions and dynamic source management
- Enhanced visual presentation with improved contrast and spacing for better readability

### ICP/Cycles Conversion Table
- Display a table showing average daily ICP/cycles conversion rates calculated from available API sources
- Table starts from September 1st, 2025 onwards and extends to the current day
- Accurate calculations with proper date formatting and data aggregation
- Clear date labeling for each entry with source attribution
- Professional table styling consistent with trading application aesthetics with improved contrast and readability
- Data source attribution displayed below the table with all active API sources

### Configuration Menu
- Logo management: users can upload custom logos (PNG, JPG, JPEG, GIF) with bulletproof file validation, size limits, and comprehensive error handling
- Cross-browser compatibility for logo uploads (Chrome, Firefox, Safari, Edge)
- Custom app name setting
- Option to revert to default logo
- QR code generator: users enter a URL and generate QR codes instantly in the frontend
- All configuration settings persist across sessions
- Detailed error and success messages for all operations

### User Interface
- ICP logo displayed in upper left corner (default or user-uploaded)
- Day/night mode toggle in header with modern color palette for day mode and high-contrast dark theme for night mode
- Theme state persists across sessions with all UI elements and charts updating immediately with optimized color schemes
- Mobile-first, touch-friendly design with smooth navigation on all device sizes and proper responsive scaling
- Professional trading application aesthetics with TradingView-inspired design elements featuring high-contrast color palettes and improved visual clarity
- Responsive design across all device sizes with charts and UI elements scaling appropriately for consistent visibility
- Enhanced dashboard layout with improved contrast and spacing for better readability

### Live Data Status
- Visual status indicator: green blinking dot in header when data updates are working from primary source
- Yellow dot when primary source is unavailable but fallback sources are active
- Red dot when all updates fail for 10+ seconds
- No text-based status messages, only visual dot indicator with source awareness

### Cross-browser Compatibility
- File upload functionality works across Chrome, Firefox, Safari, and Edge
- Immediate feedback for uploads with detailed error/success messages
- Comprehensive diagnostic logging for upload issues

## Backend Requirements

### Data Storage
- Store historical ICP OHLC (open, high, low, close) price data and volume data from ICPTokens.net API as primary source with fallback data from CoinGecko, CoinMarketCap and Internet Computer Dashboard APIs
- Store daily ICP/cycles conversion rates starting from September 1st, 2025 to current day
- Store user-uploaded logos with bulletproof file handling and validation
- Store custom app names
- Store user preferences including day/night mode settings
- Cache OHLC and volume data from API sources with intelligent cache management and source prioritization

### API Endpoints
- Endpoints for fetching and caching ICP OHLC price chart data and volume data from ICPTokens.net API with fallback support
- Endpoints for real-time candlestick data fetching with comprehensive source management
- Endpoints for fetching current network metric data
- Endpoints for ICP/cycles conversion rate data with daily calculations from September 1st, 2025
- Logo upload and retrieval endpoints with comprehensive error reporting and cross-browser support
- App name setting and retrieval endpoints
- User preference management endpoints
- API source tracking and logging endpoints for diagnostic purposes
- All endpoints include proper error handling, data validation, and source coordination

## Technical Requirements
- All content and feedback in English
- Responsive design across all device sizes with TradingView-inspired elements featuring professional candlestick chart design
- Reliable day/night mode switching with persistent preferences and instant chart theme updates optimized for both light and dark modes
- Bulletproof cross-browser logo upload functionality
- Professional trading application styling and user experience with TradingView-style candlestick chart featuring dark background, red/green candles, and transparent volume bars
- Interactive chart functionality including zoom, pan, and crosshair support with precise OHLC tooltips
- Comprehensive error handling throughout the application with graceful source degradation
- Clear data source attribution for all metrics with real-time active source display
- Primary integration with ICPTokens.net API for accurate ICP OHLC market data and token information
- Automatic fallback integration with CoinGecko API, CoinMarketCap API and Internet Computer Dashboard API
- Professional candlestick chart library integration with TradingView-style design featuring true OHLC candles and transparent volume bars
- Smooth data transitions and real-time updates across all charts and metrics with dynamic source management
- React Query implementation for API queries with intelligent caching and fallback
- Browser console logging for comprehensive API source diagnostics and transparency
- Dynamic chart updates preserving data continuity when sources fail or recover
- Enhanced chart container contrast and spacing in dashboard layout for improved readability
- Proper scaling and responsive layouts for all chart elements ensuring consistent visibility across all devices
- Validation that live OHLC and volume data from APIs render accurately and clearly on candlestick charts without visual clutter or overlap
- Accurate display of OHLC values, volume, timestamps, and percentage changes from the correct data source
- Dark-themed chart design with subtle grid lines inspired by ICPTokens.net for clean professional appearance
- Side-by-side trading metrics synchronized with chart's active timeframe for real-time data correlation
- Modern tick labeling system with professional formatting matching ICPTokens.net standards
