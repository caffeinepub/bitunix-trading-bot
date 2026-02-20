import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldTradeRecord = {
    tradeId : Text;
    symbol : Text;
    tradeType : Text;
    side : Text;
    amount : Float;
    price : Float;
    timestamp : Int;
    botType : ?BotType;
  };

  type BotType = {
    #grid;
    #macdRsi;
    #emaScalping;
  };

  type GridBotConfig = {
    upperBound : Float;
    lowerBound : Float;
    gridLevels : Nat;
    investmentPerGrid : Float;
  };

  type MacdRsiBotConfig = {
    timeframe : Text;
    leverage : Float;
    positionSize : Float;
  };

  type EmaScalpingBotConfig = {
    ema9Period : Nat;
    ema21Period : Nat;
    stopLossPercent : Float;
    takeProfitPercent : Float;
  };

  type BotConfig = {
    botType : BotType;
    mode : BotMode;
    gridConfig : ?GridBotConfig;
    macdRsiConfig : ?MacdRsiBotConfig;
    emaScalpingConfig : ?EmaScalpingBotConfig;
    riskManagement : RiskManagement;
  };

  type BotMode = {
    #manual;
    #automated;
  };

  type RiskManagement = {
    stopLossPercent : Float;
    takeProfitPercent : Float;
    maxPositionSize : Float;
    dailyLossLimit : Float;
  };

  type OldApiCredentials = {
    apiKey : Text;
    apiSecret : Text;
    encryptedAt : Int;
  };

  type OldUserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Int;
  };

  type OldActor = {
    tradingHistory : Map.Map<Principal, [OldTradeRecord]>;
    botConfigs : Map.Map<Principal, [BotConfig]>;
    apiCredentials : Map.Map<Principal, OldApiCredentials>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    username : Text;
    email : Text;
    createdAtNanos : Int;
  };

  type NewApiCredentials = {
    apiKey : Text;
    apiSecret : Text;
    isValid : Bool;
    enabledBotTypes : [BotType];
    createdAtNanos : Int;
  };

  type NewActor = {
    tradingHistory : Map.Map<Principal, [OldTradeRecord]>;
    botConfigs : Map.Map<Principal, [BotConfig]>;
    apiCredentials : Map.Map<Principal, NewApiCredentials>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newApiCredentials = old.apiCredentials.map<Principal, OldApiCredentials, NewApiCredentials>(
      func(_principal, oldCreds) {
        {
          oldCreds with
          isValid = true;
          enabledBotTypes = [#grid, #macdRsi, #emaScalping];
          createdAtNanos = oldCreds.encryptedAt * 1_000_000_000;
        };
      }
    );

    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          oldProfile with
          username = oldProfile.name;
          email = switch (oldProfile.email) { case (null) { "" }; case (?email) { email } };
          createdAtNanos = oldProfile.createdAt * 1_000_000_000;
        };
      }
    );

    {
      old with
      apiCredentials = newApiCredentials;
      userProfiles = newUserProfiles;
    };
  };
};

