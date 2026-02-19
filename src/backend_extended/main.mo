import Cycles "mo:base/ExperimentalCycles";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Registry "blob-storage/registry";



actor Main {
  transient let textMap = OrderedMap.Make<Text>(Text.compare);

  type MetricType = {
    #cycleBurnRate;
    #transactionsPerSecond;
    #icpPrice;
    #canisterStorage;
    #canisterCount;
    #subnetCount;
    #nodeProviderCount;
    #nodeMachineCount;
  };

  type MetricDataPoint = {
    value : Float;
    timestamp : Time.Time;
  };

  type ChartData = {
    hourly : [MetricDataPoint];
    daily : [MetricDataPoint];
    weekly : [MetricDataPoint];
    monthly : [MetricDataPoint];
    yearly : [MetricDataPoint];
  };

  type UserPreferences = {
    dayMode : Bool;
    customAppName : ?Text;
    customLogoPath : ?Text;
  };

  var metricData : OrderedMap.Map<Text, [MetricDataPoint]> = textMap.empty();
  var userPreferences : OrderedMap.Map<Text, UserPreferences> = textMap.empty();
  var defaultLogoPath : Text = "icp_logo.png";
  let registry = Registry.new();

  public shared ({ caller }) func registerFileReference(path : Text, hash : Text) : async () {
    Registry.add(registry, path, hash);
  };

  public query func getFileReference(path : Text) : async Registry.FileReference {
    Registry.get(registry, path);
  };

  public query func listFileReferences() : async [Registry.FileReference] {
    Registry.list(registry);
  };

  public shared ({ caller }) func dropFileReference(path : Text) : async () {
    Registry.remove(registry, path);
  };

  public shared func storeMetricData(metricType : MetricType, value : Float) : async () {
    let timestamp = Time.now();
    let key = switch (metricType) {
      case (#cycleBurnRate) { "cycleBurnRate" };
      case (#transactionsPerSecond) { "transactionsPerSecond" };
      case (#icpPrice) { "icpPrice" };
      case (#canisterStorage) { "canisterStorage" };
      case (#canisterCount) { "canisterCount" };
      case (#subnetCount) { "subnetCount" };
      case (#nodeProviderCount) { "nodeProviderCount" };
      case (#nodeMachineCount) { "nodeMachineCount" };
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
  };

  public query func getHistoricalData(metricType : MetricType) : async [MetricDataPoint] {
    let key = switch (metricType) {
      case (#cycleBurnRate) { "cycleBurnRate" };
      case (#transactionsPerSecond) { "transactionsPerSecond" };
      case (#icpPrice) { "icpPrice" };
      case (#canisterStorage) { "canisterStorage" };
      case (#canisterCount) { "canisterCount" };
      case (#subnetCount) { "subnetCount" };
      case (#nodeProviderCount) { "nodeProviderCount" };
      case (#nodeMachineCount) { "nodeMachineCount" };
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

  public query func getChartData(metricType : MetricType) : async ChartData {
    let key = switch (metricType) {
      case (#cycleBurnRate) { "cycleBurnRate" };
      case (#transactionsPerSecond) { "transactionsPerSecond" };
      case (#icpPrice) { "icpPrice" };
      case (#canisterStorage) { "canisterStorage" };
      case (#canisterCount) { "canisterCount" };
      case (#subnetCount) { "subnetCount" };
      case (#nodeProviderCount) { "nodeProviderCount" };
      case (#nodeMachineCount) { "nodeMachineCount" };
    };

    let data = switch (textMap.get(metricData, key)) {
      case (?d) { d };
      case null { [] };
    };

    let chartData : ChartData = {
      hourly = data;
      daily = data;
      weekly = data;
      monthly = data;
      yearly = data;
    };

    chartData;
  };

  public shared func clearMetricData(metricType : MetricType) : async () {
    let key = switch (metricType) {
      case (#cycleBurnRate) { "cycleBurnRate" };
      case (#transactionsPerSecond) { "transactionsPerSecond" };
      case (#icpPrice) { "icpPrice" };
      case (#canisterStorage) { "canisterStorage" };
      case (#canisterCount) { "canisterCount" };
      case (#subnetCount) { "subnetCount" };
      case (#nodeProviderCount) { "nodeProviderCount" };
      case (#nodeMachineCount) { "nodeMachineCount" };
    };

    metricData := textMap.delete(metricData, key);
  };

  public shared func clearUserPreferences(userId : Text) : async () {
    userPreferences := textMap.delete(userPreferences, userId);
  };

  public query func getAllMetricTypes() : async [Text] {
    Iter.toArray(textMap.keys(metricData));
  };

type __CAFFEINE_STORAGE_RefillInformation = {
    proposed_top_up_amount: ?Nat;
};

type __CAFFEINE_STORAGE_RefillResult = {
    success: ?Bool;
    topped_up_amount: ?Nat;
};

    public shared (msg) func __CAFFEINE_STORAGE_refillCashier(refill_information: ?__CAFFEINE_STORAGE_RefillInformation) : async __CAFFEINE_STORAGE_RefillResult {
    let cashier = Principal.fromText("72ch2-fiaaa-aaaar-qbsvq-cai");
    
    assert (cashier == msg.caller);
    
    let current_balance = Cycles.balance();
    let reserved_cycles : Nat = 400_000_000_000;
    
    let current_free_cycles_count : Nat = Nat.sub(current_balance, reserved_cycles);
    
    let cycles_to_send : Nat = switch (refill_information) {
        case null { current_free_cycles_count };
        case (?info) {
            switch (info.proposed_top_up_amount) {
                case null { current_free_cycles_count };
                case (?proposed) { Nat.min(proposed, current_free_cycles_count) };
            }
        };
    };

    let target_canister = actor(Principal.toText(cashier)) : actor {
        account_top_up_v1 : ({ account : Principal }) -> async ();
    };
    
    let current_principal = Principal.fromActor(Main);
    
    await (with cycles = cycles_to_send) target_canister.account_top_up_v1({ account = current_principal });
    
    return {
        success = ?true;
        topped_up_amount = ?cycles_to_send;
    };
};
    public shared (msg) func __CAFFEINE_STORAGE_blobsToRemove() : async [Text] {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    
    Registry.getBlobsToRemove(registry);
};
    public shared (msg) func __CAFFEINE_STORAGE_blobsRemoved(hashes : [Text]) : async Nat {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    
    Registry.clearBlobsRemoved(registry, hashes);
};
    public shared (msg) func __CAFFEINE_STORAGE_updateGatewayPrincipals() : async () {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    await Registry.updateGatewayPrincipals(registry, "72ch2-fiaaa-aaaar-qbsvq-cai");
};
};
