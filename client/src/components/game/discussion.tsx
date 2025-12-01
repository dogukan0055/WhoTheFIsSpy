import React from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Clock, Vote, MessageCircleQuestion, Home, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useLocation } from 'wouter';
import { playSound } from '@/lib/audio';
import { toast } from '@/hooks/use-toast';

export default function Discussion() {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [guess, setGuess] = React.useState('');
  const [showGuess, setShowGuess] = React.useState(false);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't use progress bar, use something else as requested.
  // Maybe a circular timer or just a clean digital display with an icon.

  const handleExit = () => {
    playSound('click');
    dispatch({ type: 'RESET_GAME' });
    navigate('/');
  };

  const submitGuess = () => {
    const cleaned = guess.trim();
    if (!cleaned) {
      toast({ title: t('discussion.invalidGuess') });
      return;
    }
    dispatch({ type: 'SPY_GUESS', payload: cleaned });
    toast({ title: t('discussion.guessSubmitted') });
    setShowGuess(false);
    setGuess('');
  };

  return (
    <div className="flex flex-col items-center h-full space-y-8 py-6">
      {/* Timer Header */}
      <div className="w-full space-y-4 text-center">
        {state.settings.isTimerOn && (
          <div className="relative py-8 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 text-6xl font-mono font-bold tracking-tighter tabular-nums relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
               <Clock className={cn("w-12 h-12 animate-pulse", state.gameData.timeLeft < 60 ? "text-red-500" : "text-primary")} />
               <span className={cn(state.gameData.timeLeft < 60 && "text-red-500")}>
                 {formatTime(state.gameData.timeLeft)}
               </span>
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

      {/* Instructions - Colorful Description */}
      <div className="flex-1 w-full space-y-6 text-center">
        <div className="bg-card/50 border border-border p-6 rounded-xl backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2 text-foreground">
            <MessageCircleQuestion className="w-6 h-6 text-blue-400" />
            {t('discussion.phaseTitle')}
          </h3>
          <div className="text-sm leading-relaxed space-y-2">
            <p>
              <span className="text-blue-400 font-bold">{t('discussion.civiliansLabel')}:</span> {t('discussion.civiliansHint')}
            </p>
            <p>
              <span className="text-red-400 font-bold">{t('discussion.spiesLabel')}:</span> {t('discussion.spiesHint')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-card/30 p-4 rounded-lg border border-white/5">
             <span className="block text-2xl font-bold font-mono mb-1">{state.players.filter(p => !p.isDead).length}</span>
             <span className="text-xs uppercase text-muted-foreground">{t('discussion.agentsActive')}</span>
           </div>
           <div className="bg-card/30 p-4 rounded-lg border border-white/5">
             <span className="block text-2xl font-bold font-mono mb-1">{state.gameData.spiesRemaining || state.settings.spyCount}</span>
             <span className="text-xs uppercase text-muted-foreground">{t('discussion.spiesRemaining')}</span>
           </div>
        </div>
      </div>

      {/* Action */}
      <div className="w-full pt-8 space-y-3">
        <Button
          variant="outline"
          className="w-full h-12 text-sm justify-center gap-2"
          onClick={() => setShowGuess(!showGuess)}
        >
          <AlertTriangle className="w-4 h-4" />
          {t('discussion.spyGuess')}
        </Button>
        {showGuess && (
          <div className="space-y-2 bg-card/40 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-left">{t('discussion.spyGuessHint')}</p>
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder={t('discussion.spyGuessPlaceholder')}
              className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm"
            />
            <Button size="sm" className="w-full" onClick={submitGuess}>
              {t('discussion.submitGuess')}
            </Button>
          </div>
        )}
        <Button
          size="lg"
          variant="destructive"
          className="w-full h-16 text-lg font-bold font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
          onClick={() => dispatch({ type: 'START_VOTING' })}
        >
          <Vote className="mr-2 w-6 h-6" />
          Call Vote
        </Button>
        <Button
          variant="ghost"
          className="w-full h-12 text-sm justify-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleExit}
        >
          <Home className="w-4 h-4" />
          {t('discussion.exit')}
        </Button>
        <p className="text-xs text-muted-foreground text-center text-balance">{t('discussion.exitDesc')}</p>
      </div>
    </div>
  );
}
