import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import ManualTrading from './pages/ManualTrading';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfileSetupModal from './components/auth/ProfileSetupModal';

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <ProfileSetupModal />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

const manualTradingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manual-trading',
  component: () => (
    <ProtectedRoute>
      <ManualTrading />
    </ProtectedRoute>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, manualTradingRoute, settingsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
