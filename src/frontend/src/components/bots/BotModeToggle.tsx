import { useUpdateBotConfig } from '../../hooks/useQueries';
import type { BotConfig } from '../../backend';
import { BotMode } from '../../backend';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface BotModeToggleProps {
  config: BotConfig;
  index: number;
}

export default function BotModeToggle({ config, index }: BotModeToggleProps) {
  const updateConfig = useUpdateBotConfig();

  const isAutomated = config.mode === BotMode.automated;

  const handleToggle = async () => {
    try {
      await updateConfig.mutateAsync({
        index: BigInt(index),
        config: {
          ...config,
          mode: isAutomated ? BotMode.manual : BotMode.automated,
        },
      });
      toast.success(`Bot switched to ${isAutomated ? 'manual' : 'automated'} mode`);
    } catch (error) {
      console.error('Failed to toggle bot mode:', error);
      toast.error('Failed to toggle bot mode');
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <div className="space-y-0.5">
        <Label htmlFor={`mode-${index}`} className="text-sm font-medium">
          {isAutomated ? 'Automated Mode' : 'Manual Mode'}
        </Label>
        <p className="text-xs text-muted-foreground">
          {isAutomated ? 'Bot executes trades automatically' : 'Manual control only'}
        </p>
      </div>
      <Switch
        id={`mode-${index}`}
        checked={isAutomated}
        onCheckedChange={handleToggle}
        disabled={updateConfig.isPending}
      />
    </div>
  );
}
