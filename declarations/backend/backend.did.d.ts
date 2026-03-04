import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ChartDataPoint {
  'low' : number,
  'high' : number,
  'close' : number,
  'open' : number,
  'volume' : number,
  'timestamp' : Time,
}
export type ChartTimeframe = { 'all' : null } |
  { 'sevenDays' : null } |
  { 'oneYear' : null } |
  { 'threeMonths' : null } |
  { 'oneMonth' : null } |
  { 'sixMonths' : null } |
  { 'oneDay' : null };
export interface ConversionRate { 'date' : string, 'rate' : number }
export interface FileReference { 'hash' : string, 'path' : string }
export interface MetricDataPoint { 'value' : number, 'timestamp' : Time }
export type MetricType = { 'canisterStorage' : null } |
  { 'cycleBurnRate' : null } |
  { 'icpCyclesConversion' : null } |
  { 'transactionsPerSecond' : null } |
  { 'canisterCount' : null } |
  { 'subnetCount' : null } |
  { 'nodeProviderCount' : null } |
  { 'nodeMachineCount' : null };
export type Time = bigint;
export interface UserPreferences {
  'customLogoPath' : [] | [string],
  'customAppName' : [] | [string],
  'dayMode' : boolean,
}
export interface _SERVICE {
  'clearChartData' : ActorMethod<[ChartTimeframe], undefined>,
  'clearConversionRate' : ActorMethod<[string], undefined>,
  'clearMetricData' : ActorMethod<[MetricType], undefined>,
  'clearUserPreferences' : ActorMethod<[string], undefined>,
  'dropFileReference' : ActorMethod<[string], undefined>,
  'getAllChartTimeframes' : ActorMethod<[], Array<string>>,
  'getAllConversionRates' : ActorMethod<[], Array<ConversionRate>>,
  'getAllMetricTypes' : ActorMethod<[], Array<string>>,
  'getChartData' : ActorMethod<[ChartTimeframe], Array<ChartDataPoint>>,
  'getConversionRate' : ActorMethod<[string], [] | [ConversionRate]>,
  'getDefaultLogoPath' : ActorMethod<[], string>,
  'getFileReference' : ActorMethod<[string], FileReference>,
  'getHistoricalData' : ActorMethod<[MetricType], Array<MetricDataPoint>>,
  'getLastUpdated' : ActorMethod<[], Time>,
  'getUserPreferences' : ActorMethod<[string], [] | [UserPreferences]>,
  'listFileReferences' : ActorMethod<[], Array<FileReference>>,
  'registerFileReference' : ActorMethod<[string, string], undefined>,
  'setDefaultLogoPath' : ActorMethod<[string], undefined>,
  'setUserPreferences' : ActorMethod<
    [string, boolean, [] | [string], [] | [string]],
    undefined
  >,
  'storeChartData' : ActorMethod<
    [ChartTimeframe, Array<ChartDataPoint>],
    undefined
  >,
  'storeConversionRate' : ActorMethod<[string, number], undefined>,
  'storeMetricData' : ActorMethod<[MetricType, number], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
