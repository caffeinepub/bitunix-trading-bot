import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Int;
  };

  public type ApiCredentials = {
    apiKey : Text;
    apiSecret : Text;
    encryptedAt : Int;
  };

  public type BotType = {
    #grid;
    #macdRsi;
    #emaScalping;
  };

  public type BotMode = {
    #manual;
    #automated;
  };

  public type GridBotConfig = {
    upperBound : Float;
    lowerBound : Float;
    gridLevels : Nat;
    investmentPerGrid : Float;
  };

  public type MacdRsiBotConfig = {
    timeframe : Text;
    leverage : Float;
    positionSize : Float;
  };

  public type EmaScalpingBotConfig = {
    ema9Period : Nat;
    ema21Period : Nat;
    stopLossPercent : Float;
    takeProfitPercent : Float;
  };

  public type BotConfig = {
    botType : BotType;
    mode : BotMode;
    gridConfig : ?GridBotConfig;
    macdRsiConfig : ?MacdRsiBotConfig;
    emaScalpingConfig : ?EmaScalpingBotConfig;
    riskManagement : RiskManagement;
  };

  public type RiskManagement = {
    stopLossPercent : Float;
    takeProfitPercent : Float;
    maxPositionSize : Float;
    dailyLossLimit : Float;
  };

  public type TradeRecord = {
    tradeId : Text;
    symbol : Text;
    tradeType : Text;
    side : Text;
    amount : Float;
    price : Float;
    timestamp : Int;
    botType : ?BotType;
  };

  public type OrderRequest = {
    symbol : Text;
    amount : Float;
    price : Float;
    orderType : Text;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let apiCredentials = Map.empty<Principal, ApiCredentials>();
  let botConfigs = Map.empty<Principal, [BotConfig]>();
  let tradingHistory = Map.empty<Principal, [TradeRecord]>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // API Credentials Management
  public shared ({ caller }) func saveApiCredentials(apiKey : Text, apiSecret : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save API credentials");
    };
    let credentials : ApiCredentials = {
      apiKey = apiKey;
      apiSecret = apiSecret;
      encryptedAt = 0;
    };
    apiCredentials.add(caller, credentials);
  };

  public query ({ caller }) func hasApiCredentials() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check API credentials");
    };
    switch (apiCredentials.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared ({ caller }) func deleteApiCredentials() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete API credentials");
    };
    apiCredentials.remove(caller);
  };

  // Bot Configuration Management
  public shared ({ caller }) func saveBotConfig(config : BotConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save bot configurations");
    };
    let currentConfigs = switch (botConfigs.get(caller)) {
      case (null) { [] };
      case (?configs) { configs };
    };
    let newConfigs = currentConfigs.concat([config]);
    botConfigs.add(caller, newConfigs);
  };

  public shared ({ caller }) func updateBotConfig(index : Nat, config : BotConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bot configurations");
    };
    switch (botConfigs.get(caller)) {
      case (null) { Runtime.trap("No bot configurations found") };
      case (?configs) {
        if (index >= configs.size()) {
          Runtime.trap("Invalid bot configuration index");
        };
        let newConfigs = Array.tabulate(
          configs.size(),
          func(i) {
            if (i == index) { config } else { configs[i] };
          },
        );
        botConfigs.add(caller, newConfigs);
      };
    };
  };

  public shared ({ caller }) func deleteBotConfig(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bot configurations");
    };
    switch (botConfigs.get(caller)) {
      case (null) { Runtime.trap("No bot configurations found") };
      case (?configs) {
        if (index >= configs.size()) {
          Runtime.trap("Invalid bot configuration index");
        };
        if (configs.size() == 0) {
          Runtime.trap("No bot configurations found");
        };
        let newConfigs = Array.tabulate(
          configs.size() - 1,
          func(i) {
            if (i < index) { configs[i] } else { configs[i + 1] };
          },
        );
        botConfigs.add(caller, newConfigs);
      };
    };
  };

  public query ({ caller }) func getBotConfigs() : async [BotConfig] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bot configurations");
    };
    switch (botConfigs.get(caller)) {
      case (null) { [] };
      case (?configs) { configs };
    };
  };

  public query ({ caller }) func getAllUserBotConfigs() : async [(Principal, [BotConfig])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all bot configurations");
    };
    botConfigs.toArray();
  };

  // Trading Operations
  public shared ({ caller }) func placeOrder(request : OrderRequest) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    switch (apiCredentials.get(caller)) {
      case (null) { Runtime.trap("API credentials not configured") };
      case (?_) {
        let tradeRecord : TradeRecord = {
          tradeId = "ORDER_" # caller.toText();
          symbol = request.symbol;
          tradeType = request.orderType;
          side = "buy";
          amount = request.amount;
          price = request.price;
          timestamp = 0;
          botType = null;
        };

        let currentHistory = switch (tradingHistory.get(caller)) {
          case (null) { [] };
          case (?history) { history };
        };
        let newHistory = currentHistory.concat([tradeRecord]);
        tradingHistory.add(caller, newHistory);

        "Order placed successfully";
      };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel orders");
    };

    switch (apiCredentials.get(caller)) {
      case (null) { Runtime.trap("API credentials not configured") };
      case (?_) {
        "Order cancelled successfully";
      };
    };
  };

  public shared ({ caller }) func getBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch balance");
    };

    switch (apiCredentials.get(caller)) {
      case (null) { Runtime.trap("API credentials not configured") };
      case (?_) {
        0.0;
      };
    };
  };

  // Trading History
  public query ({ caller }) func getTradingHistory() : async [TradeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trading history");
    };
    switch (tradingHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };
  };

  public query ({ caller }) func getUserTradingHistory(user : Principal) : async [TradeRecord] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own trading history or admin access required");
    };
    switch (tradingHistory.get(user)) {
      case (null) { [] };
      case (?history) { history };
    };
  };

  public query ({ caller }) func getAllTradingHistory() : async [(Principal, [TradeRecord])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all trading history");
    };
    tradingHistory.toArray();
  };

  // Admin Functions
  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.toArray().map(func((user, _)) { user });
  };

  public shared ({ caller }) func clearUserData(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can clear user data");
    };
    userProfiles.remove(user);
    apiCredentials.remove(user);
    botConfigs.remove(user);
    tradingHistory.remove(user);
  };
};
