import { useState } from 'react';
import { useUpdateBotConfig } from '../../hooks/useQueries';
import type { BotConfig } from '../../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { toast } from 'sonner';

interface MacdRsiBotConfigProps {
  config: BotConfig;
  index: number;
}

export default function MacdRsiBotConfig({ config, index }: MacdRsiBotConfigProps) {
  const updateConfig = useUpdateBotConfig();
  const [timeframe, setTimeframe] = useState(config.macdRsiConfig?.timeframe || '1h');
  const [leverage, setLeverage] = useState(config.macdRsiConfig?.leverage || 5);
  const [positionSize, setPositionSize] = useState(config.macdRsiConfig?.positionSize || 100);

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        index: BigInt(index),
        config: {
          ...config,
          macdRsiConfig: {
            timeframe,
            leverage,
            positionSize,
          },
        },
      });
      toast.success('MACD+RSI bot configuration saved');
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
          <strong>Strategy:</strong> Buy when MACD crosses above signal line AND RSI {'<'} 30. Sell when MACD
          crosses below signal line AND RSI {'>'} 70.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger id="timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Minute</SelectItem>
              <SelectItem value="5m">5 Minutes</SelectItem>
              <SelectItem value="15m">15 Minutes</SelectItem>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="4h">4 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leverage">Leverage: {leverage}x</Label>
          <Slider
            id="leverage"
            min={1}
            max={20}
            step={1}
            value={[leverage]}
            onValueChange={(v) => setLeverage(v[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="positionSize">Position Size ($)</Label>
          <Input
            id="positionSize"
            type="number"
            value={positionSize}
            onChange={(e) => setPositionSize(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-medium">Strategy Summary</h4>
        <p className="text-sm text-muted-foreground">Timeframe: {timeframe}</p>
        <p className="text-sm text-muted-foreground">Leverage: {leverage}x</p>
        <p className="text-sm text-muted-foreground">Position size: ${positionSize}</p>
        <p className="text-sm text-muted-foreground">
          Effective position: ${(positionSize * leverage).toFixed(2)}
        </p>
      </div>

      <Button onClick={handleSave} disabled={updateConfig.isPending} className="w-full">
        {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
