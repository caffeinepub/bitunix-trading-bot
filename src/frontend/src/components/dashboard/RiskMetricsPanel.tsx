import { useGetTradingHistory } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';

export default function RiskMetricsPanel() {
  const { data: tradingHistory, isLoading, isFetched } = useGetTradingHistory();

  // Wait for data to be fully loaded before calculating metrics
  if (isLoading || !isFetched || !tradingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Management Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-32" />
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-32" />
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTrades = tradingHistory.filter((trade) => {
    const tradeDate = new Date(Number(trade.timestamp));
    return tradeDate >= today;
  });

  const dailyProfitLoss = todayTrades.reduce((sum, trade) => {
    const tradeValue = trade.amount * trade.price;
    return sum + (trade.side === 'buy' ? -tradeValue : tradeValue);
  }, 0);

  const dailyLossLimit = 1000;
  const remainingLimit = Math.max(0, dailyLossLimit + dailyProfitLoss);
  const limitUsagePercent = Math.min(100, ((dailyLossLimit - remainingLimit) / dailyLossLimit) * 100);

  const totalOpenPositions = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Risk Management Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Today's P/L</p>
            </div>
            <p className={`text-2xl font-bold ${dailyProfitLoss >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {dailyProfitLoss >= 0 ? '+' : ''}${dailyProfitLoss.toFixed(2)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Daily Loss Limit</p>
            </div>
            <p className="text-2xl font-bold">${remainingLimit.toFixed(2)}</p>
            <Progress
              value={limitUsagePercent}
              className={`mt-2 ${limitUsagePercent > 80 ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {limitUsagePercent.toFixed(0)}% of ${dailyLossLimit} limit used
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Open Positions</p>
            </div>
            <p className="text-2xl font-bold">{totalOpenPositions}</p>
            <p className="text-sm text-muted-foreground mt-1">{todayTrades.length} trades today</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
