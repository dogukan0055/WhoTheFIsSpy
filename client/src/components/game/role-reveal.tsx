import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint, User } from 'lucide-react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { playSound, vibrate } from '@/lib/audio';
import { useTranslation } from '@/hooks/use-translation';
import { getLocationName } from '@/lib/location-i18n';

export default function RoleReveal() {
  const { state, dispatch } = useGame();
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [holdProgress, setHoldProgress] = React.useState(0);
  const holdStartRef = React.useRef<number | null>(null);
  const holdRafRef = React.useRef<number | null>(null);
  const { t, language } = useTranslation();
  const [isHolding, setIsHolding] = React.useState(false);
  
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
    // "Do not allow sounds in offline reveal role section. It's a hint for other players."
    vibrate(50); // Short vibration is discreet enough
  };

  const stopHold = (skipReset = false) => {
    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    holdRafRef.current = null;
    holdStartRef.current = null;
    setIsHolding(false);
    if (!skipReset && !isRevealed) {
      setHoldProgress(0);
    }
  };

  const beginHold = () => {
    if (isRevealed || holdStartRef.current !== null) return;
    setIsHolding(true);
    holdStartRef.current = performance.now();

    const step = (now: number) => {
      if (holdStartRef.current === null) return;
      const elapsed = now - holdStartRef.current;
      const progress = Math.min((elapsed / 900) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        handleReveal();
        stopHold(true);
      } else {
        holdRafRef.current = requestAnimationFrame(step);
      }
    };

    holdRafRef.current = requestAnimationFrame(step);
  };

  React.useEffect(() => {
    setIsRevealed(false);
    setHoldProgress(0);
    stopHold(true);
  }, [state.gameData.currentRevealIndex]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-mono">
          Agent {state.gameData.currentRevealIndex + 1} / {state.players.length}
        </h2>
        <h1 className="text-4xl font-bold font-mono tracking-tighter">{currentPlayer.name}</h1>
      </div>

      <Card className="w-full aspect-[3/4] max-w-xs relative overflow-hidden border-2 border-border bg-card/50 backdrop-blur-sm shadow-xl">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-6">
          {!isRevealed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 w-full"
            >
              <p className="text-lg font-medium leading-tight">{t('reveal.pass')}<br/><span className="text-primary font-bold text-2xl">{currentPlayer.name}</span></p>
              <div
                className="relative w-32 h-32 mx-auto rounded-full border border-dashed border-primary/40 bg-white/5 flex items-center justify-center overflow-hidden"
                onPointerDown={beginHold}
                onPointerUp={() => stopHold()}
                onPointerLeave={() => stopHold()}
                onTouchStart={beginHold}
                onTouchEnd={() => stopHold()}
              >
                <div className="absolute inset-2 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent"
                    style={{ transform: `translateY(${100 - holdProgress}%)` }}
                  />
                  {holdProgress > 0 && holdProgress < 100 && (
                    <motion.div
                      className="absolute inset-x-0 top-1/2 h-10 bg-primary/10 blur-2xl"
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  {isHolding && !isRevealed && (
                    <motion.div
                      className="absolute inset-3 rounded-full border border-primary/50"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                  {(isHolding || holdProgress > 0) && !isRevealed && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,rgba(59,130,246,0)_55%)]"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.div
                        className="absolute inset-1 overflow-hidden rounded-full pointer-events-none"
                        animate={{ opacity: [0.35, 0.8, 0.35] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      >
                        <motion.div
                          className="absolute left-3 right-3 h-16 bg-gradient-to-b from-transparent via-primary/35 to-transparent blur-sm"
                          animate={{ y: ['-30%', '120%', '-30%'] }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    </>
                  )}
                </div>
                <motion.div
                  className="absolute inset-4 rounded-full border border-primary/20"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {isHolding && (
                  <motion.div
                    className="absolute inset-3 rounded-full bg-gradient-to-b from-transparent via-primary/15 to-primary/30"
                    animate={{ y: ['-20%', '60%', '-20%'] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                )}
                <Fingerprint className="w-16 h-16 text-primary drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]" />
              </div>
              <p className="text-sm text-muted-foreground">{t('reveal.hold')}</p>
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
                  <h2 className="text-3xl font-black text-red-500 font-mono uppercase">{t('reveal.spy')}</h2>
                  <p className="text-sm text-muted-foreground">{t('reveal.spyDesc')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="w-24 h-24 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
                    <User className="w-12 h-12 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-400 font-mono uppercase">{t('reveal.civilian')}</h2>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 uppercase mb-1">{t('reveal.location')}</p>
                    <p className="text-2xl font-bold text-blue-100">{getLocationName(language, state.gameData.currentLocation)}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>

      <Button
        size="lg"
        className="w-full max-w-xs font-mono h-14"
        variant={isRevealed ? "default" : "secondary"}
        disabled={!isRevealed}
        onClick={() => handleNext()}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isRevealed ? 'continue' : 'hold'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 text-center whitespace-normal leading-tight text-sm sm:text-base"
          >
            {isRevealed ? (isLastPlayer ? t('reveal.startMission') : t('reveal.nextAgent')) : t('reveal.tap')}
          </motion.span>
        </AnimatePresence>
      </Button>
    </div>
  );
}
