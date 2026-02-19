import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";

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

  type ChartTimeframe = {
    #oneDay;
    #sevenDays;
    #oneMonth;
    #threeMonths;
    #sixMonths;
    #oneYear;
    #all;
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

  type OldApiSource = {
    #coinGecko;
    #coinMarketCap;
    #internetComputerDashboard;
  };

  type NewApiSource = {
    #coinGecko;
    #coinMarketCap;
    #internetComputerDashboard;
    #icpTokensNet;
  };

  type OldApiSourceLog = {
    source : OldApiSource;
    timestamp : Time.Time;
    message : Text;
  };

  type NewApiSourceLog = {
    source : NewApiSource;
    timestamp : Time.Time;
    message : Text;
  };

  type OldPriceSourceData = {
    source : OldApiSource;
    price : Float;
    timestamp : Time.Time;
  };

  type NewPriceSourceData = {
    source : NewApiSource;
    price : Float;
    timestamp : Time.Time;
  };

  type CompositePriceData = {
    averagePrice : Float;
    sources : [NewPriceSourceData];
    timestamp : Time.Time;
  };

  type OrderBookEntry = {
    price : Float;
    amount : Float;
    source : NewApiSource;
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
    source : NewApiSource;
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
    apiSourceLogs : OrderedMap.Map<Text, [OldApiSourceLog]>;
    priceData : OrderedMap.Map<Text, OldPriceSourceData>;
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
    apiSourceLogs : OrderedMap.Map<Text, [NewApiSourceLog]>;
    priceData : OrderedMap.Map<Text, NewPriceSourceData>;
    compositePriceData : OrderedMap.Map<Text, CompositePriceData>;
    orderBookData : OrderedMap.Map<Text, OrderBookData>;
    priceChanges : OrderedMap.Map<Text, PriceChange>;
  };

  public func run(old : OldActor) : NewActor {
    let textMap = OrderedMap.Make<Text>(Text.compare);

    let apiSourceLogs = textMap.map<[OldApiSourceLog], [NewApiSourceLog]>(
      old.apiSourceLogs,
      func(_key, oldLogs) {
        Array.map<OldApiSourceLog, NewApiSourceLog>(
          oldLogs,
          func(oldLog) {
            {
              source = switch (oldLog.source) {
                case (#coinGecko) { #coinGecko };
                case (#coinMarketCap) { #coinMarketCap };
                case (#internetComputerDashboard) { #internetComputerDashboard };
              };
              timestamp = oldLog.timestamp;
              message = oldLog.message;
            };
          },
        );
      },
    );

    let priceData = textMap.map<OldPriceSourceData, NewPriceSourceData>(
      old.priceData,
      func(_key, oldData) {
        {
          source = switch (oldData.source) {
            case (#coinGecko) { #coinGecko };
            case (#coinMarketCap) { #coinMarketCap };
            case (#internetComputerDashboard) { #internetComputerDashboard };
          };
          price = oldData.price;
          timestamp = oldData.timestamp;
        };
      },
    );

    {
      metricData = old.metricData;
      userPreferences = old.userPreferences;
      conversionRates = old.conversionRates;
      chartData = old.chartData;
      defaultLogoPath = old.defaultLogoPath;
      lastUpdated = old.lastUpdated;
      apiStatus = old.apiStatus;
      apiSourceLogs;
      priceData;
      compositePriceData = old.compositePriceData;
      orderBookData = old.orderBookData;
      priceChanges = old.priceChanges;
    };
  };
};

