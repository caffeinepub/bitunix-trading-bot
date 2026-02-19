import type { BotConfig } from '../../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GridBotConfig from './GridBotConfig';
import MacdRsiBotConfig from './MacdRsiBotConfig';
import EmaScalpingBotConfig from './EmaScalpingBotConfig';
import RiskManagementForm from './RiskManagementForm';

interface BotConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: BotConfig;
  index: number;
}

export default function BotConfigDialog({ open, onOpenChange, config, index }: BotConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bot Configuration</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
          </TabsList>
          <TabsContent value="strategy" className="space-y-4">
            {config.botType === 'grid' && <GridBotConfig config={config} index={index} />}
            {config.botType === 'macdRsi' && <MacdRsiBotConfig config={config} index={index} />}
            {config.botType === 'emaScalping' && <EmaScalpingBotConfig config={config} index={index} />}
          </TabsContent>
          <TabsContent value="risk" className="space-y-4">
            <RiskManagementForm config={config} index={index} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
