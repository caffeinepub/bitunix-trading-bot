import { useState } from 'react';
import { useUpdateBotConfig } from '../../hooks/useQueries';
import type { BotConfig } from '../../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface RiskManagementFormProps {
  config: BotConfig;
  index: number;
}

export default function RiskManagementForm({ config, index }: RiskManagementFormProps) {
  const updateConfig = useUpdateBotConfig();
  const [stopLossPercent, setStopLossPercent] = useState(config.riskManagement.stopLossPercent);
  const [takeProfitPercent, setTakeProfitPercent] = useState(config.riskManagement.takeProfitPercent);
  const [maxPositionSize, setMaxPositionSize] = useState(config.riskManagement.maxPositionSize);
  const [dailyLossLimit, setDailyLossLimit] = useState(config.riskManagement.dailyLossLimit);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        index: BigInt(index),
        config: {
          ...config,
          riskManagement: {
            stopLossPercent,
            takeProfitPercent,
            maxPositionSize,
            dailyLossLimit,
          },
        },
      });
      toast.success('Risk management settings saved');
    } catch (error) {
      console.error('Failed to save risk settings:', error);
      toast.error('Failed to save risk settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stopLoss">Stop Loss: {stopLossPercent.toFixed(2)}%</Label>
          <Slider
            id="stopLoss"
            min={0.5}
            max={10}
            step={0.5}
            value={[stopLossPercent]}
            onValueChange={(v) => setStopLossPercent(v[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="takeProfit">Take Profit: {takeProfitPercent.toFixed(2)}%</Label>
          <Slider
            id="takeProfit"
            min={0.5}
            max={20}
            step={0.5}
            value={[takeProfitPercent]}
            onValueChange={(v) => setTakeProfitPercent(v[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPosition">Maximum Position Size ($)</Label>
          <Input
            id="maxPosition"
            type="number"
            value={maxPositionSize}
            onChange={(e) => setMaxPositionSize(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dailyLimit">Daily Loss Limit ($)</Label>
          <Input
            id="dailyLimit"
            type="number"
            value={dailyLossLimit}
            onChange={(e) => setDailyLossLimit(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-medium">Risk Summary</h4>
        <p className="text-sm text-muted-foreground">Stop loss: {stopLossPercent.toFixed(2)}%</p>
        <p className="text-sm text-muted-foreground">Take profit: {takeProfitPercent.toFixed(2)}%</p>
        <p className="text-sm text-muted-foreground">Max position: ${maxPositionSize}</p>
        <p className="text-sm text-muted-foreground">Daily limit: ${dailyLossLimit}</p>
      </div>

      <Button onClick={handleSave} disabled={updateConfig.isPending} className="w-full">
        {updateConfig.isPending ? 'Saving...' : 'Save Risk Settings'}
      </Button>
    </div>
  );
}
