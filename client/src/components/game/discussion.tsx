import React from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Discussion() {
  const { state, dispatch } = useGame();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (state.gameData.timeLeft / (state.settings.timerDuration * 60)) * 100;

  return (
    <div className="flex flex-col items-center h-full space-y-8 py-6">
      {/* Timer Header */}
      <div className="w-full space-y-4">
        {state.settings.isTimerOn && (
          <div className="relative pt-4 pb-8 flex flex-col items-center">
            <div className="text-6xl font-mono font-bold tracking-tighter tabular-nums relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {formatTime(state.gameData.timeLeft)}
            </div>
            {/* Simple Progress Bar */}
            <div className="w-full h-2 bg-secondary/20 rounded-full mt-4 overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-1000 ease-linear", 
                  state.gameData.timeLeft < 60 ? "bg-red-500 animate-pulse" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {!state.settings.isTimerOn && (
           <div className="text-center py-8">
             <h2 className="text-2xl font-mono font-bold text-muted-foreground">NO TIMER</h2>
             <p className="text-sm text-muted-foreground">Take your time to discuss</p>
           </div>
        )}
      </div>

      {/* Instructions */}
      <div className="flex-1 w-full space-y-6 text-center">
        <div className="bg-card/50 border border-border p-6 rounded-xl backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Question Phase
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ask each other questions to find the spy. <br/>
            Spies: Try to figure out the location. <br/>
            Civilians: Don't be too obvious!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-card/30 p-4 rounded-lg border border-white/5">
             <span className="block text-2xl font-bold font-mono mb-1">{state.players.filter(p => !p.isDead).length}</span>
             <span className="text-xs uppercase text-muted-foreground">Players Left</span>
           </div>
           <div className="bg-card/30 p-4 rounded-lg border border-white/5">
             <span className="block text-2xl font-bold font-mono mb-1">{state.settings.spyCount}</span>
             <span className="text-xs uppercase text-muted-foreground">Spies Hidden</span>
           </div>
        </div>
      </div>

      {/* Action */}
      <div className="w-full pt-8">
        <Button 
          size="lg" 
          variant="destructive" 
          className="w-full h-16 text-lg font-bold font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
          onClick={() => dispatch({ type: 'START_VOTING' })}
        >
          <Vote className="mr-2 w-6 h-6" />
          Call Vote
        </Button>
      </div>
    </div>
  );
}
