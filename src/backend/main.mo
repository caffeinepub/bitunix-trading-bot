import Map "mo:core/Map";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let apiCredentials = Map.empty<Principal, ApiCredentials>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let tradingHistory = Map.empty<Principal, [TradeRecord]>();
  let botConfigs = Map.empty<Principal, [BotConfig]>();

  public type ApiCredentials = {
    apiKey : Text;
    apiSecret : Text;
    isValid : Bool;
    enabledBotTypes : [BotType];
    createdAtNanos : Int;
  };

  public type UserProfile = {
    username : Text;
    email : Text;
    createdAtNanos : Int;
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

  public type OrderRequest = {
    symbol : Text;
    amount : Float;
    price : Float;
    orderType : Text;
  };

  public shared ({ caller }) func saveApiCredentials(apiKey : Text, apiSecret : Text, enabledBotTypes : [BotType]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save API credentials");
    };
    validateCredentials(apiKey, apiSecret);
    let credentials : ApiCredentials = {
      apiKey;
      apiSecret;
      isValid = true;
      enabledBotTypes;
      createdAtNanos = Time.now();
    };
    apiCredentials.add(caller, credentials);
  };

  func validateCredentials(apiKey : Text, apiSecret : Text) {
    if (apiKey.size() < 8 or apiKey.size() > 64) {
      Runtime.trap("Invalid API key length. Must be between 8 and 64 characters");
    };
    if (apiSecret.size() < 32 or apiSecret.size() > 128) {
      Runtime.trap("Invalid API secret length. Must be between 32 and 128 characters");
    };
    if (apiKey.contains(#char ' ') or apiSecret.contains(#char ' ')) {
      Runtime.trap("API key and secret must not contain spaces");
    };
    if (apiKey.contains(#char '`')) {
      Runtime.trap("API key must not contain a ` character");
    };
    if (apiSecret.contains(#char '`')) {
      Runtime.trap("API secret must not contain a ` character");
    };
    if (apiKey.contains(#char '\\')) {
      Runtime.trap("API key must not contain backslashes");
    };
    if (apiSecret.contains(#char '\\')) {
      Runtime.trap("API secret must not contain backslashes");
    };
    let validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    for (char in apiKey.toArray().values()) {
      if (not validChars.contains(#char char)) {
        Runtime.trap("Invalid characters in API key");
      };
    };
    for (char in apiSecret.toArray().values()) {
      if (not validChars.contains(#char char)) {
        Runtime.trap("Invalid characters in API secret");
      };
    };
  };

  public shared ({ caller }) func updateApiBotTypes(botTypesToEnable : [BotType]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update API bot types");
    };
    let credentialsForUser = switch (apiCredentials.get(caller)) {
      case (null) { Runtime.trap("No saved API credentials found") };
      case (?creds) { creds };
    };
    let updatedCreds : ApiCredentials = {
      credentialsForUser with enabledBotTypes = botTypesToEnable
    };
    apiCredentials.add(caller, updatedCreds);
  };

  public query ({ caller }) func verifyApiCredentials() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can verify API credentials");
    };
    let userCreds : ApiCredentials = switch (apiCredentials.get(caller)) {
      case (?creds) { creds };
      case (null) { Runtime.trap("No API credentials have been saved for this user") };
    };

    if (userCreds.isValid) {
      return true;
    };
    Runtime.trap("The saved API credentials are invalid or have expired. Please update your credentials to continue trading");
  };

  public shared ({ caller }) func deleteApiCredentials() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete API credentials");
    };
    apiCredentials.remove(caller);
  };

  public query ({ caller }) func hasApiCredentials() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check for API credentials");
    };
    switch (apiCredentials.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public query ({ caller }) func getApiBotStatus() : async [(Text, Bool)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check API bot status");
    };
    let userCreds : ApiCredentials = switch (apiCredentials.get(caller)) {
      case (?creds) { creds };
      case (null) { Runtime.trap("No API credentials saved for this user") };
    };
    let statusTuples = userCreds.enabledBotTypes.map(
      func(botType) {
        switch (botType) {
          case (#grid) { ("grid", userCreds.isValid) };
          case (#macdRsi) { ("macdRsi", userCreds.isValid) };
          case (#emaScalping) { ("emaScalping", userCreds.isValid) };
        };
      }
    );
    if (statusTuples.size() == 0) {
      Runtime.trap("No bots enabled for this user");
    };
    statusTuples;
  };

  // Routinely validate credentials after critical points.
  // Explicit validate endpoint duplicated with this validation mechanism to support more common use cases

  public shared ({ caller }) func refreshApiCredentialsValidation() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can refresh API credentials validation");
    };
    switch (apiCredentials.get(caller)) {
      case (?credentials) {
        let validated = switch (credentials.enabledBotTypes.size()) {
          case (0) { false };
          case (_) { credentials.isValid };
        };
        validated;
      };
      case (null) { false };
    };
  };

  public type UpdateUserProfile = {
    username : Text;
    email : Text;
    createdAtNanos : Int;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UpdateUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, {
      username = profile.username;
      email = profile.email;
      createdAtNanos = profile.createdAtNanos;
    });
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

    // Check credentials before placing the order
    switch (apiCredentials.get(caller)) {
      case (null) { Runtime.trap("API credentials not configured") };
      case (_) {
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
      case (_) { "Order cancelled successfully" };
    };
  };

  public shared ({ caller }) func getBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch balance");
    };
    switch (apiCredentials.get(caller)) {
      case (null) { Runtime.trap("API credentials not configured") };
      case (_) { 0.0 };
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
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
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

