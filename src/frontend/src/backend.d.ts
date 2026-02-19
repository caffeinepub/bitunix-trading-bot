import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MacdRsiBotConfig {
    timeframe: string;
    leverage: number;
    positionSize: number;
}
export interface BotConfig {
    emaScalpingConfig?: EmaScalpingBotConfig;
    mode: BotMode;
    botType: BotType;
    riskManagement: RiskManagement;
    macdRsiConfig?: MacdRsiBotConfig;
    gridConfig?: GridBotConfig;
}
export interface RiskManagement {
    maxPositionSize: number;
    takeProfitPercent: number;
    stopLossPercent: number;
    dailyLossLimit: number;
}
export interface EmaScalpingBotConfig {
    ema9Period: bigint;
    takeProfitPercent: number;
    ema21Period: bigint;
    stopLossPercent: number;
}
export interface GridBotConfig {
    investmentPerGrid: number;
    lowerBound: number;
    upperBound: number;
    gridLevels: bigint;
}
export interface TradeRecord {
    tradeType: string;
    side: string;
    botType?: BotType;
    tradeId: string;
    timestamp: bigint;
    price: number;
    amount: number;
    symbol: string;
}
export interface UserProfile {
    name: string;
    createdAt: bigint;
    email?: string;
}
export interface OrderRequest {
    orderType: string;
    price: number;
    amount: number;
    symbol: string;
}
export enum BotMode {
    automated = "automated",
    manual = "manual"
}
export enum BotType {
    grid = "grid",
    emaScalping = "emaScalping",
    macdRsi = "macdRsi"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelOrder(orderId: string): Promise<string>;
    clearUserData(user: Principal): Promise<void>;
    deleteApiCredentials(): Promise<void>;
    deleteBotConfig(index: bigint): Promise<void>;
    getAllTradingHistory(): Promise<Array<[Principal, Array<TradeRecord>]>>;
    getAllUserBotConfigs(): Promise<Array<[Principal, Array<BotConfig>]>>;
    getAllUsers(): Promise<Array<Principal>>;
    getBalance(): Promise<number>;
    getBotConfigs(): Promise<Array<BotConfig>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTradingHistory(): Promise<Array<TradeRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTradingHistory(user: Principal): Promise<Array<TradeRecord>>;
    hasApiCredentials(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(request: OrderRequest): Promise<string>;
    saveApiCredentials(apiKey: string, apiSecret: string): Promise<void>;
    saveBotConfig(config: BotConfig): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBotConfig(index: bigint, config: BotConfig): Promise<void>;
}
