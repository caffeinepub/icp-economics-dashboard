export const idlFactory = ({ IDL }) => {
  const ChartTimeframe = IDL.Variant({
    'all' : IDL.Null,
    'sevenDays' : IDL.Null,
    'oneYear' : IDL.Null,
    'threeMonths' : IDL.Null,
    'oneMonth' : IDL.Null,
    'sixMonths' : IDL.Null,
    'oneDay' : IDL.Null,
  });
  const MetricType = IDL.Variant({
    'canisterStorage' : IDL.Null,
    'cycleBurnRate' : IDL.Null,
    'icpCyclesConversion' : IDL.Null,
    'transactionsPerSecond' : IDL.Null,
    'canisterCount' : IDL.Null,
    'subnetCount' : IDL.Null,
    'nodeProviderCount' : IDL.Null,
    'nodeMachineCount' : IDL.Null,
  });
  const ConversionRate = IDL.Record({
    'date' : IDL.Text,
    'rate' : IDL.Float64,
  });
  const Time = IDL.Int;
  const ChartDataPoint = IDL.Record({
    'low' : IDL.Float64,
    'high' : IDL.Float64,
    'close' : IDL.Float64,
    'open' : IDL.Float64,
    'volume' : IDL.Float64,
    'timestamp' : Time,
  });
  const FileReference = IDL.Record({ 'hash' : IDL.Text, 'path' : IDL.Text });
  const MetricDataPoint = IDL.Record({
    'value' : IDL.Float64,
    'timestamp' : Time,
  });
  const UserPreferences = IDL.Record({
    'customLogoPath' : IDL.Opt(IDL.Text),
    'customAppName' : IDL.Opt(IDL.Text),
    'dayMode' : IDL.Bool,
  });
  return IDL.Service({
    'clearChartData' : IDL.Func([ChartTimeframe], [], []),
    'clearConversionRate' : IDL.Func([IDL.Text], [], []),
    'clearMetricData' : IDL.Func([MetricType], [], []),
    'clearUserPreferences' : IDL.Func([IDL.Text], [], []),
    'dropFileReference' : IDL.Func([IDL.Text], [], []),
    'getAllChartTimeframes' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getAllConversionRates' : IDL.Func(
        [],
        [IDL.Vec(ConversionRate)],
        ['query'],
      ),
    'getAllMetricTypes' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getChartData' : IDL.Func(
        [ChartTimeframe],
        [IDL.Vec(ChartDataPoint)],
        ['query'],
      ),
    'getConversionRate' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(ConversionRate)],
        ['query'],
      ),
    'getDefaultLogoPath' : IDL.Func([], [IDL.Text], ['query']),
    'getFileReference' : IDL.Func([IDL.Text], [FileReference], ['query']),
    'getHistoricalData' : IDL.Func(
        [MetricType],
        [IDL.Vec(MetricDataPoint)],
        ['query'],
      ),
    'getLastUpdated' : IDL.Func([], [Time], ['query']),
    'getUserPreferences' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(UserPreferences)],
        ['query'],
      ),
    'listFileReferences' : IDL.Func([], [IDL.Vec(FileReference)], ['query']),
    'registerFileReference' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'setDefaultLogoPath' : IDL.Func([IDL.Text], [], []),
    'setUserPreferences' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [],
        [],
      ),
    'storeChartData' : IDL.Func(
        [ChartTimeframe, IDL.Vec(ChartDataPoint)],
        [],
        [],
      ),
    'storeConversionRate' : IDL.Func([IDL.Text, IDL.Float64], [], []),
    'storeMetricData' : IDL.Func([MetricType, IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
