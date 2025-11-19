import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGame, Player } from '@/lib/game-context';
import { containsProfanity } from '@/lib/locations';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { NumberPicker } from '@/components/ui/number-picker';
import { ArrowLeft, Users, Timer, KeyRound, Play, Database, Settings as SettingsIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/audio';
import { cn } from '@/lib/utils';

export default function OfflineSetup() {
  const { state, dispatch } = useGame();
  const [_, setLocation] = useLocation();
  const [playerNames, setPlayerNames] = useState<string[]>(
    state.players.length > 0 
      ? state.players.map(p => p.name)
      : Array(state.settings.playerCount).fill('').map((_, i) => `Player ${i + 1}`)
  );

  // Sync internal state if needed
  React.useEffect(() => {
    if (playerNames.length !== state.settings.playerCount) {
       setPlayerNames(prev => {
          const newCount = state.settings.playerCount;
          if (newCount > prev.length) {
             return [...prev, ...Array(newCount - prev.length).fill('').map((_, i) => `Player ${prev.length + i + 1}`)];
          } else {
             return prev.slice(0, newCount);
          }
       });
    }
  }, [state.settings.playerCount]);

  const handlePlayerCountChange = (val: number) => {
    playSound('click');
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { 
        playerCount: val,
        spyCount: val <= 5 ? 1 : state.settings.spyCount // Auto-adjust spy logic
      } 
    });
  };

  const handleSpyCountChange = (val: number) => {
    playSound('click');
    dispatch({ type: 'UPDATE_SETTINGS', payload: { spyCount: val } });
  };

  const handleTimerChange = (val: number) => {
    playSound('click');
    dispatch({ type: 'UPDATE_SETTINGS', payload: { timerDuration: val } });
  };

  const handleNameChange = (index: number, value: string) => {
    if (value.length > 16) return;
    if (!/^[a-zA-Z\s]*$/.test(value)) return; 
    
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    playSound('click');
    // Validation
    for (const name of playerNames) {
      if (!name.trim()) {
        toast({ title: "Invalid Name", description: "All players must have a name.", variant: "destructive" });
        playSound('error');
        return;
      }
      if (containsProfanity(name)) {
        toast({ title: "Name Rejected", description: `Name "${name}" is not allowed.`, variant: "destructive" });
        playSound('error');
        return;
      }
    }

    // Check Categories
    if (state.settings.selectedCategories.length === 0) {
      toast({ title: "No Locations", description: "Please select at least one location category in Database.", variant: "destructive" });
      playSound('error');
      return;
    }

    const players: Player[] = playerNames.map((name, idx) => ({
      id: `p-${idx}`,
      name,
      role: 'civilian',
      isDead: false,
      votes: 0
    }));

    let spiesAssigned = 0;
    while (spiesAssigned < state.settings.spyCount) {
      const randIdx = Math.floor(Math.random() * players.length);
      if (players[randIdx].role !== 'spy') {
        players[randIdx].role = 'spy';
        spiesAssigned++;
      }
    }

    // Get random category from selected ones
    const validCategories = state.gameData.categories.filter(c => state.settings.selectedCategories.includes(c.id));
    const randomCat = validCategories[Math.floor(Math.random() * validCategories.length)];
    
    if (!randomCat || randomCat.locations.length === 0) {
       toast({ title: "Empty Category", description: "Selected category has no locations.", variant: "destructive" });
       playSound('error');
       return;
    }

    const randomLoc = randomCat.locations[Math.floor(Math.random() * randomCat.locations.length)];

    dispatch({ type: 'SET_PLAYERS', payload: players });
    dispatch({ 
      type: 'START_GAME', 
      payload: { 
        location: randomLoc,
        players 
      } 
    });
    
    setLocation('/game');
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" onClick={() => playSound('click')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-mono ml-2">MISSION SETUP</h1>
        </div>
        
        <Link href="/locations">
          <Button variant="secondary" size="sm" className="font-mono text-xs" onClick={() => playSound('click')}>
            <Database className="w-4 h-4 mr-2" />
            LOCATIONS
          </Button>
        </Link>
      </div>

      <div className="space-y-8 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {/* Players Count */}
          <section className="space-y-2">
            <Label className="flex items-center text-sm text-muted-foreground"><Users className="mr-2 w-4 h-4" /> AGENTS</Label>
            <NumberPicker 
              min={4} max={8} 
              value={state.settings.playerCount}
              onChange={handlePlayerCountChange}
            />
          </section>

          {/* Spy Count */}
          <section className="space-y-2">
            <Label className="flex items-center text-sm text-muted-foreground"><KeyRound className="mr-2 w-4 h-4" /> SPIES</Label>
            {state.settings.playerCount > 5 ? (
              <NumberPicker 
                min={1} max={2} 
                value={state.settings.spyCount}
                onChange={handleSpyCountChange}
                className="border-red-500/20 bg-red-500/5"
              />
            ) : (
              <div className="h-14 flex items-center justify-center border border-white/5 rounded-lg bg-white/5 text-muted-foreground font-mono text-sm">
                1 SPY MAX
              </div>
            )}
          </section>
        </div>

        {/* Timer */}
        <section className="space-y-4 bg-card/30 p-4 rounded-lg border border-white/5">
          <div className="flex justify-between items-center">
            <Label className="flex items-center"><Timer className="mr-2 w-5 h-5 text-blue-500" /> MISSION TIMER</Label>
            <Switch 
              checked={state.settings.isTimerOn} 
              onCheckedChange={(checked) => { playSound('click'); dispatch({ type: 'UPDATE_SETTINGS', payload: { isTimerOn: checked } }); }}
            />
          </div>
          
          {state.settings.isTimerOn && (
            <NumberPicker 
              min={5} max={30} step={1}
              value={state.settings.timerDuration}
              onChange={handleTimerChange}
              label="MINUTES"
              className="mt-2"
            />
          )}
        </section>

        {/* Player Names Management */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <Label className="text-lg block">ROSTER</Label>
            <span className="text-xs text-muted-foreground font-mono">Rename agents below</span>
          </div>
          <div className="grid gap-3">
            {playerNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-muted-foreground font-mono text-xs border border-white/10">
                  {idx + 1}
                </div>
                <Input 
                  value={name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder={`Agent ${idx + 1}`}
                  className="font-mono tracking-wide bg-card/50 border-white/10 focus:border-primary/50 h-12"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/5 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <Button size="lg" className="flex-1 h-14 font-bold text-lg font-mono" onClick={handleStartGame}>
            <Play className="w-5 h-5 mr-2 fill-current" />
            START
          </Button>
        </div>
      </div>
    </Layout>
  );
}
