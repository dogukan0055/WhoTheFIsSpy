import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, User } from 'lucide-react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { playSound, vibrate } from '@/lib/audio';
import { t } from '@/lib/i18n';

export default function RoleReveal() {
  const { state, dispatch } = useGame();
  const [isRevealed, setIsRevealed] = React.useState(false);
  
  const currentPlayer = state.players[state.gameData.currentRevealIndex];
  const isLastPlayer = state.gameData.currentRevealIndex === state.players.length - 1;

  const handleNext = () => {
    // Sound allowed on navigation clicks
    playSound('click');
    if (isLastPlayer) {
      dispatch({ type: 'START_PLAYING' });
    } else {
      setIsRevealed(false);
      dispatch({ type: 'NEXT_REVEAL' });
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    // SILENT REVEAL for Offline Mode as requested
    vibrate(50); // Short vibration is discreet enough
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-mono">
          {t('agentNum', { current: state.gameData.currentRevealIndex + 1, total: state.players.length })}
        </h2>
        <h1 className="text-4xl font-bold font-mono tracking-tighter">{currentPlayer.name}</h1>
      </div>

      <Card className="w-full aspect-[3/4] max-w-xs relative overflow-hidden border-2 border-border bg-card/50 backdrop-blur-sm">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {!isRevealed ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 w-full flex flex-col items-center justify-center"
            >
              <Fingerprint className="w-24 h-24 text-muted-foreground/50 animate-pulse" />
              <p className="text-lg font-medium">Pass device to<br/><span className="text-primary font-bold text-2xl">{currentPlayer.name}</span></p>
              <p className="text-sm text-muted-foreground">Tap below to reveal</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 w-full"
            >
              {currentPlayer.role === 'spy' ? (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 animate-pulse">
                    <Fingerprint className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-red-500 font-mono uppercase">{t('youAreSpy')}</h2>
                  <p className="text-sm text-muted-foreground">{t('spyDesc')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="w-24 h-24 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
                    <User className="w-12 h-12 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-400 font-mono uppercase">{t('civilian')}</h2>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 uppercase mb-1">{t('location')}</p>
                    <p className="text-2xl font-bold text-blue-100">{state.gameData.currentLocation}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>

      <Button 
        size="lg" 
        className="w-full max-w-xs font-mono text-lg h-14"
        variant={isRevealed ? "default" : "secondary"}
        onClick={() => isRevealed ? handleNext() : handleReveal()}
      >
        {isRevealed ? (isLastPlayer ? t('startGame') : t('nextAgent')) : t('revealIdentity')}
      </Button>
    </div>
  );
}
