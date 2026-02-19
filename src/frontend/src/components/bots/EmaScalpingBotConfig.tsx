import { useState } from 'react';
import { useUpdateBotConfig } from '../../hooks/useQueries';
import type { BotConfig } from '../../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { toast } from 'sonner';

interface EmaScalpingBotConfigProps {
  config: BotConfig;
  index: number;
}

export default function EmaScalpingBotConfig({ config, index }: EmaScalpingBotConfigProps) {
  const updateConfig = useUpdateBotConfig();
  const [stopLossPercent, setStopLossPercent] = useState(config.emaScalpingConfig?.stopLossPercent || 1);
  const [takeProfitPercent, setTakeProfitPercent] = useState(config.emaScalpingConfig?.takeProfitPercent || 1.5);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        index: BigInt(index),
        config: {
          ...config,
          emaScalpingConfig: {
            ema9Period: 9n,
            ema21Period: 21n,
            stopLossPercent,
            takeProfitPercent,
          },
        },
      });
      toast.success('EMA scalping bot configuration saved');
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Failed to save configuration');
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Strategy:</strong> Buy when EMA(9) crosses above EMA(21). Sell when EMA(9) crosses below
          EMA(21). Quick entries and exits with tight stop-loss and take-profit.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stopLoss">Stop Loss: {stopLossPercent.toFixed(2)}%</Label>
          <Slider
            id="stopLoss"
            min={0.5}
            max={2}
            step={0.1}
            value={[stopLossPercent]}
            onValueChange={(v) => setStopLossPercent(v[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="takeProfit">Take Profit: {takeProfitPercent.toFixed(2)}%</Label>
          <Slider
            id="takeProfit"
            min={0.5}
            max={3}
            step={0.1}
            value={[takeProfitPercent]}
            onValueChange={(v) => setTakeProfitPercent(v[0])}
          />
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-medium">Strategy Summary</h4>
        <p className="text-sm text-muted-foreground">EMA periods: 9 and 21</p>
        <p className="text-sm text-muted-foreground">Stop loss: {stopLossPercent.toFixed(2)}%</p>
        <p className="text-sm text-muted-foreground">Take profit: {takeProfitPercent.toFixed(2)}%</p>
        <p className="text-sm text-muted-foreground">
          Risk/Reward ratio: 1:{(takeProfitPercent / stopLossPercent).toFixed(2)}
        </p>
      </div>

      <Button onClick={handleSave} disabled={updateConfig.isPending} className="w-full">
        {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
