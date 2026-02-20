import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

export default function Header() {
  const { identity } = useInternetIdentity();
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const currentPath = routerState.location.pathname;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              Bitunix Trading Bot
            </h1>
          </div>

          {isAuthenticated && (
            <nav className="flex items-center gap-4">
              <Button
                variant={currentPath === '/dashboard' ? 'default' : 'ghost'}
                onClick={() => navigate({ to: '/dashboard' })}
              >
                Dashboard
              </Button>
              <Button
                variant={currentPath === '/manual-trading' ? 'default' : 'ghost'}
                onClick={() => navigate({ to: '/manual-trading' })}
              >
                Manual Trading
              </Button>
              <Button
                variant={currentPath === '/settings' ? 'default' : 'ghost'}
                onClick={() => navigate({ to: '/settings' })}
              >
                Settings
              </Button>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="text-foreground font-medium">{userProfile.username}</span>
              </span>
            )}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
