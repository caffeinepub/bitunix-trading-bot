import { useState } from 'react';
import type { BotMetrics } from '../../hooks/useBotMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BotModeToggle from '../bots/BotModeToggle';
import BotConfigDialog from '../bots/BotConfigDialog';
import { TrendingUp, TrendingDown, Activity, Settings } from 'lucide-react';

interface BotCardProps {
  metric: BotMetrics;
  index: number;
}

export default function BotCard({ metric, index }: BotCardProps) {
  const [showConfig, setShowConfig] = useState(false);

  const getBotName = () => {
    switch (metric.botType) {
      case 'grid':
        return 'Grid Trading Bot';
      case 'macdRsi':
        return 'MACD + RSI Bot';
      case 'emaScalping':
        return 'EMA Scalping Bot';
      default:
        return 'Trading Bot';
    }
  };

  const getBotType = () => {
    return metric.botType === 'grid' ? 'Spot' : 'Futures';
  };

  const isProfitable = metric.profitLoss >= 0;

  return (
    <>
      <Card className="relative overflow-hidden group hover:border-primary/50 transition-all">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              metric.botType === 'grid' ? 'url(/assets/generated/grid-pattern.dim_600x400.png)' : 'none',
            backgroundSize: 'cover',
          }}
        />
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <img
                  src="/assets/generated/bot-icon.dim_128x128.png"
                  alt="Bot"
                  className="h-8 w-8 opacity-80"
                />
              </div>
              <div>
                <CardTitle className="text-lg">{getBotName()}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{getBotType()}</Badge>
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        metric.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {metric.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowConfig(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Profit/Loss</p>
              <p className={`text-2xl font-bold ${isProfitable ? 'text-chart-2' : 'text-destructive'}`}>
                {isProfitable ? '+' : ''}${metric.profitLoss.toFixed(2)}
              </p>
              <p className={`text-sm ${isProfitable ? 'text-chart-2' : 'text-destructive'}`}>
                {isProfitable ? '+' : ''}
                {metric.profitLossPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trades</p>
              <p className="text-2xl font-bold">{metric.tradeCount}</p>
              <p className="text-sm text-muted-foreground">{metric.openPositions} open</p>
            </div>
          </div>

          {metric.latestSignal && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Latest Signal</p>
              <div className="flex items-center gap-2">
                {metric.latestSignal.type === 'buy' ? (
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-medium capitalize">{metric.latestSignal.type}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(metric.latestSignal.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          <BotModeToggle config={metric.config} index={index} />
        </CardContent>
      </Card>

      <BotConfigDialog
        open={showConfig}
        onOpenChange={setShowConfig}
        config={metric.config}
        index={index}
      />
    </>
  );
}
