import { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Landing from './pages/Landing';
import Home from './pages/Home';
import RemindersPage from './pages/RemindersPage';
import EventsPage from './pages/EventsPage';
import MessagesPage from './pages/MessagesPage';
import TripsPage from './pages/TripsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import FindFriendsPage from './pages/FindFriendsPage';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRouter() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">S</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <Switch>
      <Route path="/reminders" component={RemindersPage} />
      <Route path="/prescriptions" component={PrescriptionsPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/trips" component={TripsPage} />
      <Route path="/find-friends" component={FindFriendsPage} />
      <Route component={Home} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;

