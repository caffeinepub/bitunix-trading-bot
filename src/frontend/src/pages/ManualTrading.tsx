import { useState } from 'react';
import { useGetBalance, useGetTradingHistory } from '../hooks/useQueries';
import ManualTradeForm from '../components/trading/ManualTradeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Footer from '../components/layout/Footer';

export default function ManualTrading() {
  const { data: balance = 0 } = useGetBalance();
  const { data: tradingHistory = [] } = useGetTradingHistory();
  const [activeTab, setActiveTab] = useState<'spot' | 'futures'>('spot');

  const manualTrades = tradingHistory.filter((trade) => !trade.botType);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Manual Trading</h1>
        <p className="text-muted-foreground">Execute spot and futures trades manually</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
          <CardDescription>Your current trading balance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">${balance.toFixed(2)} USDT</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'spot' | 'futures')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="spot">Spot Trading</TabsTrigger>
          <TabsTrigger value="futures">Futures Trading</TabsTrigger>
        </TabsList>
        <TabsContent value="spot" className="space-y-4">
          <ManualTradeForm type="spot" />
        </TabsContent>
        <TabsContent value="futures" className="space-y-4">
          <ManualTradeForm type="futures" />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Manual Trades</CardTitle>
          <CardDescription>Your manually executed trades</CardDescription>
        </CardHeader>
        <CardContent>
          {manualTrades.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No manual trades yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualTrades.slice(-10).reverse().map((trade) => (
                  <TableRow key={trade.tradeId}>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'}>
                        {trade.side.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.amount}</TableCell>
                    <TableCell>${trade.price.toFixed(2)}</TableCell>
                    <TableCell>{trade.tradeType}</TableCell>
                    <TableCell>{new Date(Number(trade.timestamp)).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}
