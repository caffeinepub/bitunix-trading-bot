import { useMemo } from 'react';
import { useGetBotConfigs, useGetTradingHistory } from './useQueries';
import type { BotConfig, BotType, TradeRecord } from '../backend';
import { BotMode } from '../backend';

export interface BotMetrics {
  botType: BotType;
  config: BotConfig;
  isActive: boolean;
  profitLoss: number;
  profitLossPercent: number;
  tradeCount: number;
  openPositions: number;
  latestSignal?: {
    type: string;
    timestamp: number;
  };
}

export function useBotMetrics() {
  const { data: botConfigs = [], isLoading: configsLoading } = useGetBotConfigs();
  const { data: tradingHistory = [], isLoading: historyLoading } = useGetTradingHistory();

  const metrics = useMemo(() => {
    return botConfigs.map((config): BotMetrics => {
      const botTrades = tradingHistory.filter(
        (trade) => trade.botType && trade.botType === config.botType
      );

      const profitLoss = botTrades.reduce((sum, trade) => {
        const tradeValue = trade.amount * trade.price;
        return sum + (trade.side === 'buy' ? -tradeValue : tradeValue);
      }, 0);

      const totalInvestment = botTrades.reduce((sum, trade) => {
        if (trade.side === 'buy') {
          return sum + trade.amount * trade.price;
        }
        return sum;
      }, 0);

      const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

      const latestTrade = botTrades.length > 0 ? botTrades[botTrades.length - 1] : undefined;

      return {
        botType: config.botType,
        config,
        isActive: config.mode === BotMode.automated,
        profitLoss,
        profitLossPercent,
        tradeCount: botTrades.length,
        openPositions: 0,
        latestSignal: latestTrade
          ? {
              type: latestTrade.side,
              timestamp: Number(latestTrade.timestamp),
            }
          : undefined,
      };
    });
  }, [botConfigs, tradingHistory]);

  return {
    metrics,
    isLoading: configsLoading || historyLoading,
  };
}
