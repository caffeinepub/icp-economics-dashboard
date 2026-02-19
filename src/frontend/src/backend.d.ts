import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserPreferences {
    customLogoPath?: string;
    customAppName?: string;
    dayMode: boolean;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ChartDataResponse {
    source: ApiSource;
    data: Array<ChartDataPoint>;
    timestamp: Time;
    priceChange: PriceChange;
}
export interface PriceChange {
    timeframe: string;
    percentage: number;
}
export interface ApiResponse {
    status: ApiStatus;
    message: string;
    timestamp: Time;
}
export interface MetricDataPoint {
    value: number;
    timestamp: Time;
}
export interface OrderBookEntry {
    source: ApiSource;
    timestamp: Time;
    price: number;
    amount: number;
}
export interface ChartDataPoint {
    low: number;
    high: number;
    close: number;
    open: number;
    volume: number;
    timestamp: Time;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OrderBookData {
    asks: Array<OrderBookEntry>;
    bids: Array<OrderBookEntry>;
    timestamp: Time;
}
export interface ApiSourceLog {
    source: ApiSource;
    message: string;
    timestamp: Time;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PriceSourceData {
    source: ApiSource;
    timestamp: Time;
    price: number;
}
export interface CompositePriceData {
    averagePrice: number;
    timestamp: Time;
    sources: Array<PriceSourceData>;
}
export interface FileReference {
    hash: string;
    path: string;
}
export interface ConversionRate {
    date: string;
    rate: number;
}
export enum ApiSource {
    internetComputerDashboard = "internetComputerDashboard",
    icpTokensNet = "icpTokensNet",
    coinGecko = "coinGecko",
    coinMarketCap = "coinMarketCap"
}
export enum ApiStatus {
    pending = "pending",
    error = "error",
    success = "success"
}
export enum ChartTimeframe {
    all = "all",
    sevenDays = "sevenDays",
    oneYear = "oneYear",
    threeMonths = "threeMonths",
    oneMonth = "oneMonth",
    sixMonths = "sixMonths",
    oneDay = "oneDay"
}
export enum MetricType {
    canisterStorage = "canisterStorage",
    cycleBurnRate = "cycleBurnRate",
    icpCyclesConversion = "icpCyclesConversion",
    transactionsPerSecond = "transactionsPerSecond",
    canisterCount = "canisterCount",
    subnetCount = "subnetCount",
    nodeProviderCount = "nodeProviderCount",
    nodeMachineCount = "nodeMachineCount"
}
export interface backendInterface {
    clearApiSourceLogs(apiName: string): Promise<void>;
    clearApiStatus(apiName: string): Promise<void>;
    clearChartData(timeframe: ChartTimeframe): Promise<void>;
    clearCompositePriceData(): Promise<void>;
    clearConversionRate(date: string): Promise<void>;
    clearMetricData(metricType: MetricType): Promise<void>;
    clearOrderBookData(source: ApiSource): Promise<void>;
    clearPriceChange(timeframe: string): Promise<void>;
    clearPriceData(source: ApiSource): Promise<void>;
    clearUserPreferences(userId: string): Promise<void>;
    dropFileReference(path: string): Promise<void>;
    fetchChartDataFromCoinGecko(timeframe: ChartTimeframe): Promise<ChartDataResponse>;
    fetchChartDataFromCoinMarketCap(timeframe: ChartTimeframe): Promise<ChartDataResponse>;
    fetchChartDataFromICDashboard(timeframe: ChartTimeframe): Promise<ChartDataResponse>;
    fetchChartDataFromICPTokensNet(timeframe: ChartTimeframe): Promise<ChartDataResponse>;
    fetchChartDataWithFallback(timeframe: ChartTimeframe): Promise<ChartDataResponse>;
    getAllApiStatuses(): Promise<Array<ApiResponse>>;
    getAllChartTimeframes(): Promise<Array<string>>;
    getAllConversionRates(): Promise<Array<ConversionRate>>;
    getAllMetricTypes(): Promise<Array<string>>;
    getAllOrderBookData(): Promise<Array<OrderBookData>>;
    getAllPriceChanges(): Promise<Array<PriceChange>>;
    getAllPriceData(): Promise<Array<PriceSourceData>>;
    getApiSourceLogs(apiName: string): Promise<Array<ApiSourceLog>>;
    getApiStatus(apiName: string): Promise<ApiResponse | null>;
    getChartData(timeframe: ChartTimeframe): Promise<Array<ChartDataPoint>>;
    getCompositePriceData(): Promise<CompositePriceData | null>;
    getConversionRate(date: string): Promise<ConversionRate | null>;
    getDefaultLogoPath(): Promise<string>;
    getFileReference(path: string): Promise<FileReference>;
    getHistoricalData(metricType: MetricType): Promise<Array<MetricDataPoint>>;
    getLastUpdated(): Promise<Time>;
    getOrderBookData(source: ApiSource): Promise<OrderBookData | null>;
    getPriceChange(timeframe: string): Promise<PriceChange | null>;
    getPriceData(source: ApiSource): Promise<PriceSourceData | null>;
    getUserPreferences(userId: string): Promise<UserPreferences | null>;
    listFileReferences(): Promise<Array<FileReference>>;
    logApiSource(apiName: string, source: ApiSource, message: string): Promise<void>;
    registerFileReference(path: string, hash: string): Promise<void>;
    setDefaultLogoPath(path: string): Promise<void>;
    setUserPreferences(userId: string, dayMode: boolean, customAppName: string | null, customLogoPath: string | null): Promise<void>;
    storeApiStatus(apiName: string, status: ApiStatus, message: string): Promise<void>;
    storeChartData(timeframe: ChartTimeframe, data: Array<ChartDataPoint>): Promise<void>;
    storeCompositePriceData(averagePrice: number, sources: Array<PriceSourceData>): Promise<void>;
    storeConversionRate(date: string, rate: number): Promise<void>;
    storeMetricData(metricType: MetricType, value: number): Promise<void>;
    storeOrderBookData(source: ApiSource, bids: Array<OrderBookEntry>, asks: Array<OrderBookEntry>): Promise<void>;
    storePriceChange(timeframe: string, percentage: number): Promise<void>;
    storePriceData(source: ApiSource, price: number): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
