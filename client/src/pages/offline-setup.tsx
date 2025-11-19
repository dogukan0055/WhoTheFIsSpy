import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useGame, Player } from '@/lib/game-context';
import { containsProfanity } from '@/lib/locations';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, Timer, UserPlus, X, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function OfflineSetup() {
  const { state, dispatch } = useGame();
  const [_, setLocation] = useLocation();
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill('').map((_, i) => `Player ${i + 1}`));
  const [timerVal, setTimerVal] = useState(5);

  // Settings Handlers
  const handlePlayerCountChange = (val: number) => {
    const newCount = val;
    let newNames = [...playerNames];
    
    if (newCount > playerNames.length) {
      // Add players
      for (let i = playerNames.length; i < newCount; i++) {
        newNames.push(`Player ${i + 1}`);
      }
    } else {
      // Remove players
      newNames = newNames.slice(0, newCount);
    }
    
    setPlayerNames(newNames);
    
    // Auto adjust spies
    let newSpyCount = state.settings.spyCount;
    if (newCount <= 5) newSpyCount = 1;
    
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { 
        playerCount: newCount,
        spyCount: newSpyCount 
      } 
    });
  };

  const handleNameChange = (index: number, value: string) => {
    if (value.length > 16) return;
    if (!/^[a-zA-Z\s]*$/.test(value)) return; // Only A-Z
    
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    // Validation
    for (const name of playerNames) {
      if (!name.trim()) {
        toast({ title: "Invalid Name", description: "All players must have a name.", variant: "destructive" });
        return;
      }
      if (containsProfanity(name)) {
        toast({ title: "Name Rejected", description: `Name "${name}" is not allowed.`, variant: "destructive" });
        return;
      }
    }

    // Assign Roles
    const totalPlayers = playerNames.length;
    const spyCount = state.settings.spyCount;
    
    // Create player objects
    const players: Player[] = playerNames.map((name, idx) => ({
      id: `p-${idx}`,
      name,
      role: 'civilian',
      isDead: false,
      votes: 0
    }));

    // Randomly assign spies
    let spiesAssigned = 0;
    while (spiesAssigned < spyCount) {
      const randIdx = Math.floor(Math.random() * totalPlayers);
      if (players[randIdx].role !== 'spy') {
        players[randIdx].role = 'spy';
        spiesAssigned++;
      }
    }

    // Select Random Location
    const categoryId = 'standard'; // For now hardcode or use state
    const category = state.gameData.categories.find(c => c.id === categoryId) || state.gameData.categories[0];
    const randomLoc = category.locations[Math.floor(Math.random() * category.locations.length)];

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
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold font-mono ml-2">MISSION SETUP</h1>
      </div>

      <div className="space-y-8 pb-20">
        {/* Players Count */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="flex items-center text-lg"><Users className="mr-2 w-5 h-5 text-primary" /> Players</Label>
            <span className="font-mono font-bold text-2xl">{state.settings.playerCount}</span>
          </div>
          <Slider 
            defaultValue={[4]} 
            min={4} 
            max={8} 
            step={1} 
            value={[state.settings.playerCount]}
            onValueChange={(val) => handlePlayerCountChange(val[0])}
            className="py-4"
          />
        </section>

        {/* Spy Count */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="flex items-center text-lg"><KeyRound className="mr-2 w-5 h-5 text-red-500" /> Spies</Label>
            <span className="font-mono font-bold text-2xl text-red-500">{state.settings.spyCount}</span>
          </div>
           {state.settings.playerCount > 5 ? (
             <Slider 
              defaultValue={[1]} 
              min={1} 
              max={2} 
              step={1} 
              value={[state.settings.spyCount]}
              onValueChange={(val) => dispatch({ type: 'UPDATE_SETTINGS', payload: { spyCount: val[0] } })}
              className="py-4"
            />
           ) : (
             <p className="text-xs text-muted-foreground">Minimum 6 players required for 2 spies.</p>
           )}
        </section>

        {/* Timer */}
        <section className="space-y-4 bg-card/30 p-4 rounded-lg border border-white/5">
          <div className="flex justify-between items-center">
            <Label className="flex items-center"><Timer className="mr-2 w-5 h-5 text-blue-500" /> Timer</Label>
            <Switch 
              checked={state.settings.isTimerOn} 
              onCheckedChange={(checked) => dispatch({ type: 'UPDATE_SETTINGS', payload: { isTimerOn: checked } })}
            />
          </div>
          
          {state.settings.isTimerOn && (
            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>5 min</span>
                <span className="font-mono font-bold text-foreground text-base">{state.settings.timerDuration} min</span>
                <span>30 min</span>
              </div>
              <Slider 
                min={5} 
                max={30} 
                step={1} 
                value={[state.settings.timerDuration]}
                onValueChange={(val) => dispatch({ type: 'UPDATE_SETTINGS', payload: { timerDuration: val[0] } })}
              />
            </div>
          )}
        </section>

        {/* Player Names */}
        <section className="space-y-3">
          <Label className="text-lg mb-2 block">Codnames</Label>
          <div className="grid gap-3">
            {playerNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground w-6">{idx + 1}.</span>
                <Input 
                  value={name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder={`Player ${idx + 1}`}
                  className="font-mono tracking-wide bg-card/50 border-white/10 focus:border-primary/50"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-md mx-auto">
          <Button size="lg" className="w-full h-14 font-bold text-lg uppercase" onClick={handleStartGame}>
            Initialize Mission
          </Button>
        </div>
      </div>
    </Layout>
  );
}
