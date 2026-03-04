import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Registry "blob-storage/registry";
import BlobStorage "blob-storage/Mixin";
import Array "mo:base/Array";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
persistent actor {
  transient let textMap = OrderedMap.Make<Text>(Text.compare);

  type MetricType = {
    #cycleBurnRate;
    #transactionsPerSecond;
    #canisterStorage;
    #canisterCount;
    #subnetCount;
    #nodeProviderCount;
    #nodeMachineCount;
    #icpCyclesConversion;
  };

  type MetricDataPoint = {
    value : Float;
    timestamp : Time.Time;
  };

  type UserPreferences = {
    dayMode : Bool;
    customAppName : ?Text;
    customLogoPath : ?Text;
  };

  type ConversionRate = {
    date : Text;
    rate : Float;
  };

  type ChartDataPoint = {
    timestamp : Time.Time;
    open : Float;
    high : Float;
    low : Float;
    close : Float;
    volume : Float;
  };

  type ChartTimeframe = {
    #fifteenMinutes;
    #oneHour;
    #fourHours;
    #eightHours;
    #oneDay;
    #sevenDays;
    #oneMonth;
    #oneYear;
  };

  type ApiStatus = {
    #success;
    #error;
    #pending;
  };

  type ApiResponse = {
    status : ApiStatus;
    message : Text;
    timestamp : Time.Time;
  };

  type ApiSource = {
    #coinGecko;
    #coinMarketCap;
    #internetComputerDashboard;
    #icpTokensNet;
  };

  type ApiSourceLog = {
    source : ApiSource;
    timestamp : Time.Time;
    message : Text;
  };

  type PriceSourceData = {
    source : ApiSource;
    price : Float;
    timestamp : Time.Time;
  };

  type CompositePriceData = {
    averagePrice : Float;
    sources : [PriceSourceData];
    timestamp : Time.Time;
  };

  type OrderBookEntry = {
    price : Float;
    amount : Float;
    source : ApiSource;
    timestamp : Time.Time;
  };

  type OrderBookData = {
    bids : [OrderBookEntry];
    asks : [OrderBookEntry];
    timestamp : Time.Time;
  };

  type PriceChange = {
    percentage : Float;
    timeframe : Text;
  };

  type ChartDataResponse = {
    data : [ChartDataPoint];
    source : ApiSource;
    priceChange : PriceChange;
    timestamp : Time.Time;
  };

  var metricData : OrderedMap.Map<Text, [MetricDataPoint]> = textMap.empty();
  var userPreferences : OrderedMap.Map<Text, UserPreferences> = textMap.empty();
  var conversionRates : OrderedMap.Map<Text, ConversionRate> = textMap.empty();
  var chartData : OrderedMap.Map<Text, [ChartDataPoint]> = textMap.empty();
  var defaultLogoPath : Text = "icp_logo.png";
  var lastUpdated : Time.Time = 0;
  var apiStatus : OrderedMap.Map<Text, ApiResponse> = textMap.empty();
  var apiSourceLogs : OrderedMap.Map<Text, [ApiSourceLog]> = textMap.empty();
  var priceData : OrderedMap.Map<Text, PriceSourceData> = textMap.empty();
  var compositePriceData : OrderedMap.Map<Text, CompositePriceData> = textMap.empty();
  var orderBookData : OrderedMap.Map<Text, OrderBookData> = textMap.empty();
  var priceChanges : OrderedMap.Map<Text, PriceChange> = textMap.empty();

  let registry = Registry.new();
  include BlobStorage(registry);

  public shared func storeMetricData(metricType : MetricType, value : Float) : async () {
    let timestamp = Time.now();
    let key = switch (metricType) {
      case (#cycleBurnRate) { "cycleBurnRate" };
      case (#transactionsPerSecond) { "transactionsPerSecond" };
      case (#canisterStorage) { "canisterStorage" };
      case (#canisterCount) { "canisterCount" };
      case (#subnetCount) { "subnetCount" };
      case (#nodeProviderCount) { "nodeProviderCount" };
      case (#nodeMachineCount) { "nodeMachineCount" };
      case (#icpCyclesConversion) { "icpCyclesConversion" };
    };

    let dataPoint : MetricDataPoint = {
      value;
      timestamp;
    };

    let existingData = switch (textMap.get(metricData, key)) {
      case (?data) { data };
      case null { [] };
    };

    let newData = Array.append(existingData, [dataPoint]);
    metricData := textMap.put(metricData, key, newData);
    lastUpdated := timestamp;
  };

  public query func getHistoricalData(metricType : MetricType) : async [MetricDataPoint] {
    let key = switch (metricType) {
      case (#cycleBurnRate) { "cycleBurnRate" };
      case (#transactionsPerSecond) { "transactionsPerSecond" };
      case (#canisterStorage) { "canisterStorage" };
      case (#canisterCount) { "canisterCount" };
      case (#subnetCount) { "subnetCount" };
      case (#nodeProviderCount) { "nodeProviderCount" };
      case (#nodeMachineCount) { "nodeMachineCount" };
      case (#icpCyclesConversion) { "icpCyclesConversion" };
    };

    switch (textMap.get(metricData, key)) {
      case (?data) { data };
      case null { [] };
    };
  };

  public shared func setUserPreferences(userId : Text, dayMode : Bool, customAppName : ?Text, customLogoPath : ?Text) : async () {
    let preferences : UserPreferences = {
      dayMode;
      customAppName;
      customLogoPath;
    };
    userPreferences := textMap.put(userPreferences, userId, preferences);
  };

  public query func getUserPreferences(userId : Text) : async ?UserPreferences {
    textMap.get(userPreferences, userId);
  };

  public query func getDefaultLogoPath() : async Text {
    defaultLogoPath;
  };

  public shared func setDefaultLogoPath(path : Text) : async () {
    defaultLogoPath := path;
  };

  public shared func clearMetricData(metricType : MetricType) : async () {
    let key = switch (metricType) {
      case (#cycleBurnRate) { "cycleBurnRate" };
      case (#transactionsPerSecond) { "transactionsPerSecond" };
      case (#canisterStorage) { "canisterStorage" };
      case (#canisterCount) { "canisterCount" };
      case (#subnetCount) { "subnetCount" };
      case (#nodeProviderCount) { "nodeProviderCount" };
      case (#nodeMachineCount) { "nodeMachineCount" };
      case (#icpCyclesConversion) { "icpCyclesConversion" };
    };

    metricData := textMap.delete(metricData, key);
  };

  public shared func clearUserPreferences(userId : Text) : async () {
    userPreferences := textMap.delete(userPreferences, userId);
  };

  public query func getAllMetricTypes() : async [Text] {
    Iter.toArray(textMap.keys(metricData));
  };

  public shared func storeConversionRate(date : Text, rate : Float) : async () {
    let conversionRate : ConversionRate = {
      date;
      rate;
    };
    conversionRates := textMap.put(conversionRates, date, conversionRate);
  };

  public query func getConversionRate(date : Text) : async ?ConversionRate {
    textMap.get(conversionRates, date);
  };

  public query func getAllConversionRates() : async [ConversionRate] {
    Iter.toArray(textMap.vals(conversionRates));
  };

  public shared func clearConversionRate(date : Text) : async () {
    conversionRates := textMap.delete(conversionRates, date);
  };

  public query func getLastUpdated() : async Time.Time {
    lastUpdated;
  };

  public shared func storeChartData(timeframe : ChartTimeframe, data : [ChartDataPoint]) : async () {
    let key = switch (timeframe) {
      case (#fifteenMinutes) { "15m" };
      case (#oneHour) { "1h" };
      case (#fourHours) { "4h" };
      case (#eightHours) { "8h" };
      case (#oneDay) { "1d" };
      case (#sevenDays) { "7d" };
      case (#oneMonth) { "1m" };
      case (#oneYear) { "1y" };
    };
    chartData := textMap.put(chartData, key, data);
    lastUpdated := Time.now();
  };

  public query func getChartData(timeframe : ChartTimeframe) : async [ChartDataPoint] {
    let key = switch (timeframe) {
      case (#fifteenMinutes) { "15m" };
      case (#oneHour) { "1h" };
      case (#fourHours) { "4h" };
      case (#eightHours) { "8h" };
      case (#oneDay) { "1d" };
      case (#sevenDays) { "7d" };
      case (#oneMonth) { "1m" };
      case (#oneYear) { "1y" };
    };

    switch (textMap.get(chartData, key)) {
      case (?data) { data };
      case null { [] };
    };
  };

  public shared func clearChartData(timeframe : ChartTimeframe) : async () {
    let key = switch (timeframe) {
      case (#fifteenMinutes) { "15m" };
      case (#oneHour) { "1h" };
      case (#fourHours) { "4h" };
      case (#eightHours) { "8h" };
      case (#oneDay) { "1d" };
      case (#sevenDays) { "7d" };
      case (#oneMonth) { "1m" };
      case (#oneYear) { "1y" };
    };
    chartData := textMap.delete(chartData, key);
  };

  public query func getAllChartTimeframes() : async [Text] {
    Iter.toArray(textMap.keys(chartData));
  };

  public shared func storeApiStatus(apiName : Text, status : ApiStatus, message : Text) : async () {
    let response : ApiResponse = {
      status;
      message;
      timestamp = Time.now();
    };
    apiStatus := textMap.put(apiStatus, apiName, response);
  };

  public query func getApiStatus(apiName : Text) : async ?ApiResponse {
    textMap.get(apiStatus, apiName);
  };

  public query func getAllApiStatuses() : async [ApiResponse] {
    Iter.toArray(textMap.vals(apiStatus));
  };

  public shared func clearApiStatus(apiName : Text) : async () {
    apiStatus := textMap.delete(apiStatus, apiName);
  };

  public shared func logApiSource(apiName : Text, source : ApiSource, message : Text) : async () {
    let logEntry : ApiSourceLog = {
      source;
      timestamp = Time.now();
      message;
    };

    let existingLogs = switch (textMap.get(apiSourceLogs, apiName)) {
      case (?logs) { logs };
      case null { [] };
    };

    let newLogs = Array.append(existingLogs, [logEntry]);
    apiSourceLogs := textMap.put(apiSourceLogs, apiName, newLogs);
  };

  public query func getApiSourceLogs(apiName : Text) : async [ApiSourceLog] {
    switch (textMap.get(apiSourceLogs, apiName)) {
      case (?logs) { logs };
      case null { [] };
    };
  };

  public shared func clearApiSourceLogs(apiName : Text) : async () {
    apiSourceLogs := textMap.delete(apiSourceLogs, apiName);
  };

  public shared func storePriceData(source : ApiSource, price : Float) : async () {
    let timestamp = Time.now();
    let key = switch (source) {
      case (#coinGecko) { "coinGecko" };
      case (#coinMarketCap) { "coinMarketCap" };
      case (#internetComputerDashboard) { "internetComputerDashboard" };
      case (#icpTokensNet) { "icpTokensNet" };
    };

    let priceDataPoint : PriceSourceData = {
      source;
      price;
      timestamp;
    };

    priceData := textMap.put(priceData, key, priceDataPoint);
  };

  public query func getPriceData(source : ApiSource) : async ?PriceSourceData {
    let key = switch (source) {
      case (#coinGecko) { "coinGecko" };
      case (#coinMarketCap) { "coinMarketCap" };
      case (#internetComputerDashboard) { "internetComputerDashboard" };
      case (#icpTokensNet) { "icpTokensNet" };
    };
    textMap.get(priceData, key);
  };

  public query func getAllPriceData() : async [PriceSourceData] {
    Iter.toArray(textMap.vals(priceData));
  };

  public shared func clearPriceData(source : ApiSource) : async () {
    let key = switch (source) {
      case (#coinGecko) { "coinGecko" };
      case (#coinMarketCap) { "coinMarketCap" };
      case (#internetComputerDashboard) { "internetComputerDashboard" };
      case (#icpTokensNet) { "icpTokensNet" };
    };
    priceData := textMap.delete(priceData, key);
  };

  public shared func storeCompositePriceData(averagePrice : Float, sources : [PriceSourceData]) : async () {
    let timestamp = Time.now();
    let compositeData : CompositePriceData = {
      averagePrice;
      sources;
      timestamp;
    };
    compositePriceData := textMap.put(compositePriceData, "composite", compositeData);
  };

  public query func getCompositePriceData() : async ?CompositePriceData {
    textMap.get(compositePriceData, "composite");
  };

  public shared func clearCompositePriceData() : async () {
    compositePriceData := textMap.delete(compositePriceData, "composite");
  };

  public shared func storeOrderBookData(source : ApiSource, bids : [OrderBookEntry], asks : [OrderBookEntry]) : async () {
    let timestamp = Time.now();
    let key = switch (source) {
      case (#coinGecko) { "coinGecko" };
      case (#coinMarketCap) { "coinMarketCap" };
      case (#internetComputerDashboard) { "internetComputerDashboard" };
      case (#icpTokensNet) { "icpTokensNet" };
    };

    let orderBook : OrderBookData = {
      bids;
      asks;
      timestamp;
    };

    orderBookData := textMap.put(orderBookData, key, orderBook);
  };

  public query func getOrderBookData(source : ApiSource) : async ?OrderBookData {
    let key = switch (source) {
      case (#coinGecko) { "coinGecko" };
      case (#coinMarketCap) { "coinMarketCap" };
      case (#internetComputerDashboard) { "internetComputerDashboard" };
      case (#icpTokensNet) { "icpTokensNet" };
    };
    textMap.get(orderBookData, key);
  };

  public query func getAllOrderBookData() : async [OrderBookData] {
    Iter.toArray(textMap.vals(orderBookData));
  };

  public shared func clearOrderBookData(source : ApiSource) : async () {
    let key = switch (source) {
      case (#coinGecko) { "coinGecko" };
      case (#coinMarketCap) { "coinMarketCap" };
      case (#internetComputerDashboard) { "internetComputerDashboard" };
      case (#icpTokensNet) { "icpTokensNet" };
    };
    orderBookData := textMap.delete(orderBookData, key);
  };

  public shared func storePriceChange(timeframe : Text, percentage : Float) : async () {
    let priceChange : PriceChange = {
      percentage;
      timeframe;
    };
    priceChanges := textMap.put(priceChanges, timeframe, priceChange);
  };

  public query func getPriceChange(timeframe : Text) : async ?PriceChange {
    textMap.get(priceChanges, timeframe);
  };

  public query func getAllPriceChanges() : async [PriceChange] {
    Iter.toArray(textMap.vals(priceChanges));
  };

  public shared func clearPriceChange(timeframe : Text) : async () {
    priceChanges := textMap.delete(priceChanges, timeframe);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared func fetchChartDataFromICPTokensNet(timeframe : ChartTimeframe) : async ChartDataResponse {
    let url = switch (timeframe) {
      case (#fifteenMinutes) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=15m&range=1d" };
      case (#oneHour) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=1h&range=1d" };
      case (#fourHours) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=4h&range=1d" };
      case (#eightHours) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=8h&range=1d" };
      case (#oneDay) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=5m&range=1d" };
      case (#sevenDays) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=1h&range=7d" };
      case (#oneMonth) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=4h&range=30d" };
      case (#oneYear) { "https://icptokens.net/api/v1/markets/icp/ohlc?interval=1d&range=365d" };
    };

    let response = await OutCall.httpGetRequest(url, [], transform);

    let chartDataPoints : [ChartDataPoint] = [];
    let priceChange : PriceChange = {
      percentage = 0.0;
      timeframe = "1D";
    };

    let chartDataResponse : ChartDataResponse = {
      data = chartDataPoints;
      source = #icpTokensNet;
      priceChange;
      timestamp = Time.now();
    };

    chartDataResponse;
  };

  public shared func fetchChartDataFromCoinGecko(timeframe : ChartTimeframe) : async ChartDataResponse {
    let url = switch (timeframe) {
      case (#fifteenMinutes) { "https://api.coingecko.com/api/v3/coins/internet-computer/ohlc?vs_currency=usd&days=1" };
      case (#oneHour) { "https://api.coingecko.com/api/v3/coins/internet-computer/ohlc?vs_currency=usd&days=1" };
      case (#fourHours) { "https://api.coingecko.com/api/v3/coins/internet-computer/ohlc?vs_currency=usd&days=1" };
      case (#eightHours) { "https://api.coingecko.com/api/v3/coins/internet-computer/ohlc?vs_currency=usd&days=1" };
      case (#oneDay) { "https://api.coingecko.com/api/v3/coins/internet-computer/ohlc?vs_currency=usd&days=1" };
      case (#sevenDays) { "https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=7" };
      case (#oneMonth) { "https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=30" };
      case (#oneYear) { "https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=365" };
    };

    let response = await OutCall.httpGetRequest(url, [], transform);

    let chartDataPoints : [ChartDataPoint] = [];
    let priceChange : PriceChange = {
      percentage = 0.0;
      timeframe = "1D";
    };

    let chartDataResponse : ChartDataResponse = {
      data = chartDataPoints;
      source = #coinGecko;
      priceChange;
      timestamp = Time.now();
    };

    chartDataResponse;
  };

  public shared func fetchChartDataFromCoinMarketCap(timeframe : ChartTimeframe) : async ChartDataResponse {
    let url = switch (timeframe) {
      case (#fifteenMinutes) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=15m&count=96" };
      case (#oneHour) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=1h&count=24" };
      case (#fourHours) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=4h&count=6" };
      case (#eightHours) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=8h&count=3" };
      case (#oneDay) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=5m&count=288" };
      case (#sevenDays) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=1h&count=168" };
      case (#oneMonth) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=4h&count=180" };
      case (#oneYear) { "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=ICP&interval=1d&count=365" };
    };

    let response = await OutCall.httpGetRequest(url, [], transform);

    let chartDataPoints : [ChartDataPoint] = [];
    let priceChange : PriceChange = {
      percentage = 0.0;
      timeframe = "1D";
    };

    let chartDataResponse : ChartDataResponse = {
      data = chartDataPoints;
      source = #coinMarketCap;
      priceChange;
      timestamp = Time.now();
    };

    chartDataResponse;
  };

  public shared func fetchChartDataFromICDashboard(timeframe : ChartTimeframe) : async ChartDataResponse {
    let url = switch (timeframe) {
      case (#fifteenMinutes) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=15m&range=1d" };
      case (#oneHour) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=1h&range=1d" };
      case (#fourHours) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=4h&range=1d" };
      case (#eightHours) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=8h&range=1d" };
      case (#oneDay) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=5m&range=1d" };
      case (#sevenDays) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=1h&range=7d" };
      case (#oneMonth) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=4h&range=30d" };
      case (#oneYear) { "https://dashboard.internetcomputer.org/api/v3/metrics/icp_price?interval=1d&range=365d" };
    };

    let response = await OutCall.httpGetRequest(url, [], transform);

    let chartDataPoints : [ChartDataPoint] = [];
    let priceChange : PriceChange = {
      percentage = 0.0;
      timeframe = "1D";
    };

    let chartDataResponse : ChartDataResponse = {
      data = chartDataPoints;
      source = #internetComputerDashboard;
      priceChange;
      timestamp = Time.now();
    };

    chartDataResponse;
  };

  public shared func fetchChartDataWithFallback(timeframe : ChartTimeframe) : async ChartDataResponse {
    let icpTokensNetData = await fetchChartDataFromICPTokensNet(timeframe);

    if (icpTokensNetData.data.size() > 0) {
      return icpTokensNetData;
    };

    let coinGeckoData = await fetchChartDataFromCoinGecko(timeframe);

    if (coinGeckoData.data.size() > 0) {
      return coinGeckoData;
    };

    let coinMarketCapData = await fetchChartDataFromCoinMarketCap(timeframe);

    if (coinMarketCapData.data.size() > 0) {
      return coinMarketCapData;
    };

    let icDashboardData = await fetchChartDataFromICDashboard(timeframe);

    if (icDashboardData.data.size() > 0) {
      return icDashboardData;
    };

    let emptyResponse : ChartDataResponse = {
      data = [];
      source = #icpTokensNet;
      priceChange = {
        percentage = 0.0;
        timeframe = "1D";
      };
      timestamp = Time.now();
    };

    emptyResponse;
  };
};

