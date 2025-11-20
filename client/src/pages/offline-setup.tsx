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
import { ArrowLeft, Users, Timer, KeyRound, Play, Map, Edit2, VenetianMask } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { playSound } from '@/lib/audio';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

export default function OfflineSetup() {
  const { state, dispatch } = useGame();
  const t = useTranslation(state.appSettings.language);
  const [_, setLocation] = useLocation();
  
  // Load saved names or generate defaults
  const savedNames = JSON.parse(localStorage.getItem('spy-player-names') || '[]');
  const getInitialNames = () => {
     const count = state.settings.playerCount;
     let names = [...savedNames];
     if (names.length < count) {
        for(let i = names.length; i < count; i++) {
           names.push(`${t('setup.agent')} ${i + 1}`);
        }
     } else if (names.length > count) {
        names = names.slice(0, count);
     }
     return names;
  };

  const [playerNames, setPlayerNames] = useState<string[]>(getInitialNames());
  const [isRenaming, setIsRenaming] = useState(false);

  // Sync internal state if needed
  React.useEffect(() => {
    if (playerNames.length !== state.settings.playerCount) {
       setPlayerNames(prev => {
          const newCount = state.settings.playerCount;
          if (newCount > prev.length) {
             // Add new players
             return [...prev, ...Array(newCount - prev.length).fill('').map((_, i) => `${t('setup.agent')} ${prev.length + i + 1}`)];
          } else {
             // Remove players
             return prev.slice(0, newCount);
          }
       });
    }
  }, [state.settings.playerCount, t]);

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
    // Allow UTF-8 chars for A-Z (including Turkish chars)
    if (!/^[a-zA-Z\s\u00C0-\u017F\u0131\u011F\u015F\u00FC\u00F6\u00E7\u0130\u011E\u015E\u00DC\u00D6\u00C7]*$/.test(value)) return; 
    
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    playSound('click');
    // Validation
    for (const name of playerNames) {
      if (!name.trim()) {
        toast({ title: t('toast.invalidName'), description: t('toast.allPlayersName'), variant: "destructive" });
        playSound('error');
        return;
      }
      if (containsProfanity(name)) {
        toast({ title: t('toast.nameRejected'), description: t('toast.nameNotAllowed'), variant: "destructive" });
        playSound('error');
        return;
      }
    }

    // Check Categories
    if (state.settings.selectedCategories.length === 0) {
      toast({ title: t('toast.noLocations'), description: t('toast.selectOne'), variant: "destructive" });
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
       toast({ title: t('toast.emptyCat'), description: t('toast.catEmpty'), variant: "destructive" });
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
          <h1 className="text-2xl font-bold font-mono ml-2 flex items-center gap-2">
             <VenetianMask className="w-6 h-6 text-primary" />
             {t('setup.title')}
          </h1>
        </div>
      </div>

      <div className="space-y-8 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {/* Players Count */}
          <section className="space-y-2">
            <Label className="flex items-center text-sm text-muted-foreground"><Users className="mr-2 w-4 h-4" /> {t('setup.agents')}</Label>
            <NumberPicker 
              min={4} max={8} 
              value={state.settings.playerCount}
              onChange={handlePlayerCountChange}
            />
            <div className="text-[10px] text-muted-foreground text-center">{t('setup.min')}: 4 | {t('setup.max')}: 8</div>
          </section>

          {/* Spy Count */}
          <section className="space-y-2">
            <Label className="flex items-center text-sm text-muted-foreground"><KeyRound className="mr-2 w-4 h-4" /> {t('setup.spies')}</Label>
            {state.settings.playerCount > 5 ? (
              <NumberPicker 
                min={1} max={2} 
                value={state.settings.spyCount}
                onChange={handleSpyCountChange}
                className="border-red-500/20 bg-red-500/5"
              />
            ) : (
              <div className="h-14 flex items-center justify-center border border-white/5 rounded-lg bg-white/5 text-muted-foreground font-mono text-sm">
                {t('setup.spyMax')}
              </div>
            )}
            <div className="text-[10px] text-muted-foreground text-center">
              {state.settings.playerCount > 5 ? `${t('setup.min')}: 1 | ${t('setup.max')}: 2` : t('setup.locked')}
            </div>
          </section>
        </div>

        {/* Timer */}
        <section className="space-y-4 bg-card/30 p-4 rounded-lg border border-white/5">
          <div className="flex justify-between items-center">
            <Label className="flex items-center"><Timer className="mr-2 w-5 h-5 text-blue-500" /> {t('setup.timer')}</Label>
            <Switch 
              checked={state.settings.isTimerOn} 
              onCheckedChange={(checked) => { playSound('click'); dispatch({ type: 'UPDATE_SETTINGS', payload: { isTimerOn: checked } }); }}
            />
          </div>
          
          {state.settings.isTimerOn && (
            <div className="mt-2 space-y-2">
              <NumberPicker 
                min={5} max={30} step={1}
                value={state.settings.timerDuration}
                onChange={handleTimerChange}
                label={t('setup.minutes')}
              />
               <div className="text-[10px] text-muted-foreground text-center">{t('setup.min')}: 5m | {t('setup.max')}: 30m</div>
            </div>
          )}

          {/* Locations Button (Moved under Timer) */}
          <Link href="/locations">
            <Button variant="outline" className="w-full mt-4 border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary h-12" onClick={() => playSound('click')}>
              <Map className="w-4 h-4 mr-2" />
              {t('setup.manageLocations')}
            </Button>
          </Link>
        </section>

        {/* Player Management Button */}
        <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
          <DialogTrigger asChild>
             <Button variant="secondary" className="w-full h-12" onClick={() => playSound('click')}>
               <Edit2 className="w-4 h-4 mr-2" />
               {t('setup.manageRoster')}
             </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>{t('setup.manageRoster')}</DialogTitle>
             </DialogHeader>
             <div className="space-y-3 py-4">
               {playerNames.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-muted-foreground font-mono text-xs border border-white/10">
                      {idx + 1}
                    </div>
                    <Input 
                      value={name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`${t('setup.agent')} ${idx + 1}`}
                      className="font-mono tracking-wide bg-card/50 border-white/10 focus:border-primary/50 h-12"
                    />
                  </div>
                ))}
             </div>
             <Button onClick={() => setIsRenaming(false)} className="w-full">Done</Button>
          </DialogContent>
        </Dialog>

      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/5 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <Button size="lg" className="flex-1 h-14 font-bold text-lg font-mono" onClick={handleStartGame}>
            <Play className="w-5 h-5 mr-2 fill-current" />
            {t('setup.start')}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
