import { useState } from 'react';
import { usePlaceOrder } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface ManualTradeFormProps {
  type: 'spot' | 'futures';
}

export default function ManualTradeForm({ type }: ManualTradeFormProps) {
  const placeOrder = usePlaceOrder();
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || (orderType === 'limit' && !price)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await placeOrder.mutateAsync({
        symbol,
        amount: Number(amount),
        price: orderType === 'market' ? 0 : Number(price),
        orderType: `${type}-${orderType}`,
      });
      toast.success(`${side.toUpperCase()} order placed successfully`);
      setAmount('');
      setPrice('');
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please check your API credentials.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === 'spot' ? 'Spot' : 'Futures'} Trading</CardTitle>
        <CardDescription>Place {type} orders manually</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Trading Pair</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger id="symbol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
                <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Side</Label>
            <RadioGroup value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buy" id="buy" />
                  <Label htmlFor="buy" className="cursor-pointer">
                    {type === 'futures' ? 'Long' : 'Buy'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sell" id="sell" />
                  <Label htmlFor="sell" className="cursor-pointer">
                    {type === 'futures' ? 'Short' : 'Sell'}
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {type === 'futures' && (
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
          )}

          <div className="space-y-2">
            <Label>Order Type</Label>
            <RadioGroup value={orderType} onValueChange={(v) => setOrderType(v as 'market' | 'limit')}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="market" id="market" />
                  <Label htmlFor="market" className="cursor-pointer">
                    Market
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limit" id="limit" />
                  <Label htmlFor="limit" className="cursor-pointer">
                    Limit
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {orderType === 'limit' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (USDT)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <Button type="submit" disabled={placeOrder.isPending} className="w-full">
            {placeOrder.isPending ? 'Placing Order...' : `Place ${side.toUpperCase()} Order`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
