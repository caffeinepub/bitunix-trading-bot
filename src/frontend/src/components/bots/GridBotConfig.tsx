import { useState, useEffect } from 'react';
import { useUpdateBotConfig } from '../../hooks/useQueries';
import type { BotConfig } from '../../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface GridBotConfigProps {
  config: BotConfig;
  index: number;
}

export default function GridBotConfig({ config, index }: GridBotConfigProps) {
  const updateConfig = useUpdateBotConfig();
  const [upperBound, setUpperBound] = useState(config.gridConfig?.upperBound || 50000);
  const [lowerBound, setLowerBound] = useState(config.gridConfig?.lowerBound || 40000);
  const [gridLevels, setGridLevels] = useState(Number(config.gridConfig?.gridLevels || 10n));
  const [investmentPerGrid, setInvestmentPerGrid] = useState(config.gridConfig?.investmentPerGrid || 100);

  const priceStep = (upperBound - lowerBound) / gridLevels;

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        index: BigInt(index),
        config: {
          ...config,
          gridConfig: {
            upperBound,
            lowerBound,
            gridLevels: BigInt(gridLevels),
            investmentPerGrid,
          },
        },
      });
      toast.success('Grid bot configuration saved');
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Failed to save configuration');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="upperBound">Upper Price Bound ($)</Label>
          <Input
            id="upperBound"
            type="number"
            value={upperBound}
            onChange={(e) => setUpperBound(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lowerBound">Lower Price Bound ($)</Label>
          <Input
            id="lowerBound"
            type="number"
            value={lowerBound}
            onChange={(e) => setLowerBound(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gridLevels">Number of Grid Levels: {gridLevels}</Label>
          <Slider
            id="gridLevels"
            min={5}
            max={100}
            step={5}
            value={[gridLevels]}
            onValueChange={(v) => setGridLevels(v[0])}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="investmentPerGrid">Investment per Grid ($)</Label>
          <Input
            id="investmentPerGrid"
            type="number"
            value={investmentPerGrid}
            onChange={(e) => setInvestmentPerGrid(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-medium">Grid Summary</h4>
        <p className="text-sm text-muted-foreground">
          Price range: ${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">Grid levels: {gridLevels}</p>
        <p className="text-sm text-muted-foreground">Price step: ${priceStep.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">
          Total investment: ${(investmentPerGrid * gridLevels).toFixed(2)}
        </p>
      </div>

      <Button onClick={handleSave} disabled={updateConfig.isPending} className="w-full">
        {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
