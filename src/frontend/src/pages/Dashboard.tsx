import { useBotMetrics } from '../hooks/useBotMetrics';
import BotCard from '../components/dashboard/BotCard';
import RiskMetricsPanel from '../components/dashboard/RiskMetricsPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Footer from '../components/layout/Footer';

export default function Dashboard() {
  const { metrics, isLoading, isFetched } = useBotMetrics();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['botConfigs'] });
    queryClient.invalidateQueries({ queryKey: ['tradingHistory'] });
  };

  // Show loading state until data is fully fetched
  if (isLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <p className="text-muted-foreground">Monitor your bots and trading performance</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <RiskMetricsPanel />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No bots configured yet</p>
            <p className="text-sm text-muted-foreground">
              Configure your API credentials in Settings to get started
            </p>
          </div>
        ) : (
          metrics.map((metric, index) => (
            <BotCard key={`${metric.botType}-${index}`} metric={metric} index={index} />
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
