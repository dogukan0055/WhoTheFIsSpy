import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { GameProvider } from "@/lib/game-context";

import Home from "@/pages/home";
import OfflineSetup from "@/pages/offline-setup";
import GameRoom from "@/pages/game-room";
import OnlineMenu from "@/pages/online-menu";
import OnlineRoom from "@/pages/online-room";
import Settings from "@/pages/settings";
import LocationManager from "@/pages/location-manager";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/setup" component={OfflineSetup} />
      <Route path="/settings" component={Settings} />
      <Route path="/locations" component={LocationManager} />
      <Route path="/game" component={GameRoom} />
      <Route path="/online-menu" component={OnlineMenu} />
      <Route path="/online/:code" component={OnlineRoom} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <Router />
        <Toaster />
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
