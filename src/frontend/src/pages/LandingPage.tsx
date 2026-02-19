import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import LoginButton from '../components/auth/LoginButton';
import Footer from '../components/layout/Footer';
import { TrendingUp, Bot, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url(/assets/generated/trading-hero.dim_1200x400.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative container mx-auto px-4 py-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-chart-1 via-primary to-chart-2 bg-clip-text text-transparent">
              Automated Trading on Bitunix
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional trading bots with Grid, MACD+RSI, and EMA Scalping strategies. Trade smarter, not
              harder.
            </p>
            <LoginButton />
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Three Powerful Bots</h3>
              <p className="text-muted-foreground">
                Grid trading for spot markets, MACD+RSI for trend following, and EMA scalping for quick profits.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:border-chart-1 transition-colors">
              <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Risk Management</h3>
              <p className="text-muted-foreground">
                Built-in stop-loss, take-profit, and daily loss limits to protect your capital.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:border-chart-2 transition-colors">
              <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manual & Auto Modes</h3>
              <p className="text-muted-foreground">
                Switch between automated strategies and manual trading with full control.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
