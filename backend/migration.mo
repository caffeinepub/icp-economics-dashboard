import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Time "mo:base/Time";

module {
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

  type OldChartTimeframe = {
    #oneDay;
    #sevenDays;
    #oneMonth;
    #threeMonths;
    #sixMonths;
    #oneYear;
    #all;
  };

  type NewChartTimeframe = {
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

  type OldActor = {
    metricData : OrderedMap.Map<Text, [MetricDataPoint]>;
    userPreferences : OrderedMap.Map<Text, UserPreferences>;
    conversionRates : OrderedMap.Map<Text, ConversionRate>;
    chartData : OrderedMap.Map<Text, [ChartDataPoint]>;
    defaultLogoPath : Text;
    lastUpdated : Time.Time;
    apiStatus : OrderedMap.Map<Text, ApiResponse>;
    apiSourceLogs : OrderedMap.Map<Text, [ApiSourceLog]>;
    priceData : OrderedMap.Map<Text, PriceSourceData>;
    compositePriceData : OrderedMap.Map<Text, CompositePriceData>;
    orderBookData : OrderedMap.Map<Text, OrderBookData>;
    priceChanges : OrderedMap.Map<Text, PriceChange>;
  };

  type NewActor = {
    metricData : OrderedMap.Map<Text, [MetricDataPoint]>;
    userPreferences : OrderedMap.Map<Text, UserPreferences>;
    conversionRates : OrderedMap.Map<Text, ConversionRate>;
    chartData : OrderedMap.Map<Text, [ChartDataPoint]>;
    defaultLogoPath : Text;
    lastUpdated : Time.Time;
    apiStatus : OrderedMap.Map<Text, ApiResponse>;
    apiSourceLogs : OrderedMap.Map<Text, [ApiSourceLog]>;
    priceData : OrderedMap.Map<Text, PriceSourceData>;
    compositePriceData : OrderedMap.Map<Text, CompositePriceData>;
    orderBookData : OrderedMap.Map<Text, OrderBookData>;
    priceChanges : OrderedMap.Map<Text, PriceChange>;
  };

  public func run(old : OldActor) : NewActor {
    let textMap = OrderedMap.Make<Text>(Text.compare);

    let chartData = textMap.map<[ChartDataPoint], [ChartDataPoint]>(
      old.chartData,
      func(_k, v) { v },
    );

    let conversionRates = textMap.map<ConversionRate, ConversionRate>(
      old.conversionRates,
      func(_k, v) { v },
    );

    let apiStatus = textMap.map<ApiResponse, ApiResponse>(
      old.apiStatus,
      func(_k, v) { v },
    );

    let compositePriceData = textMap.map<CompositePriceData, CompositePriceData>(
      old.compositePriceData,
      func(_k, v) { v },
    );

    let metricData = textMap.map<[MetricDataPoint], [MetricDataPoint]>(
      old.metricData,
      func(_k, v) { v },
    );

    let orderBookData = textMap.map<OrderBookData, OrderBookData>(
      old.orderBookData,
      func(_k, v) { v },
    );

    let priceChanges = textMap.map<PriceChange, PriceChange>(
      old.priceChanges,
      func(_k, v) { v },
    );

    let priceData = textMap.map<PriceSourceData, PriceSourceData>(
      old.priceData,
      func(_k, v) { v },
    );

    let apiSourceLogs = textMap.map<[ApiSourceLog], [ApiSourceLog]>(
      old.apiSourceLogs,
      func(_k, v) { v },
    );

    let userPreferences = textMap.map<UserPreferences, UserPreferences>(
      old.userPreferences,
      func(_k, v) { v },
    );

    {
      metricData;
      userPreferences;
      conversionRates;
      chartData;
      defaultLogoPath = old.defaultLogoPath;
      lastUpdated = old.lastUpdated;
      apiStatus;
      apiSourceLogs;
      priceData;
      compositePriceData;
      orderBookData;
      priceChanges;
    };
  };
};

