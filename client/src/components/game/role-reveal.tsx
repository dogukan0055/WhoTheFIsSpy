import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint, User, Home } from 'lucide-react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { playSound, vibrate } from '@/lib/audio';
import { useTranslation } from '@/hooks/use-translation';
import { getLocationName } from '@/lib/location-i18n';
import { useLocation } from 'wouter';

export default function RoleReveal() {
  const { state, dispatch } = useGame();
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [holdProgress, setHoldProgress] = React.useState(0);
  const holdStartRef = React.useRef<number | null>(null);
  const holdRafRef = React.useRef<number | null>(null);
  const { t, language } = useTranslation();
  const [isHolding, setIsHolding] = React.useState(false);
  const [, navigate] = useLocation();
  
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

  const handleExit = () => {
    playSound('click');
    dispatch({ type: 'RESET_GAME' });
    navigate('/');
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

  const showScan = (isHolding || holdProgress > 0) && !isRevealed;

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
                className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-b from-primary/10 via-background to-background border border-primary/30 shadow-2xl overflow-hidden flex items-center justify-center"
                onPointerDown={beginHold}
                onPointerUp={() => stopHold()}
                onPointerLeave={() => stopHold()}
                onTouchStart={beginHold}
                onTouchEnd={() => stopHold()}
              >
                <motion.div
                  className="absolute inset-0 rounded-full opacity-60"
                  animate={{ rotate: showScan ? [0, 8, -6, 0] : 0 }}
                  transition={{ duration: 1.2, repeat: showScan ? Infinity : 0, ease: 'easeInOut' }}
                  style={{
                    background:
                      'conic-gradient(from 120deg at 50% 50%, rgba(59,130,246,0.18), rgba(59,130,246,0.05) 30deg, rgba(59,130,246,0.18) 200deg, rgba(59,130,246,0.05) 320deg)'
                  }}
                />

                <div className="absolute inset-2 rounded-full overflow-hidden fingerprint-mesh" />

                {showScan && (
                  <motion.div
                    className="absolute inset-4 rounded-full overflow-hidden pointer-events-none"
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    <div className="fingerprint-gif" />
                  </motion.div>
                )}

                <motion.div
                  className="absolute inset-3 rounded-full border border-primary/30"
                  style={{
                    background: `conic-gradient(from 90deg, rgba(59,130,246,0.4) ${holdProgress}%, transparent ${holdProgress}% 100%)`
                  }}
                  animate={{ rotate: showScan ? 360 : 0 }}
                  transition={{ duration: 3, repeat: showScan ? Infinity : 0, ease: 'linear' }}
                />

                {showScan && (
                  <>
                    <motion.div
                      className="absolute inset-4 rounded-full border border-primary/10"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-1.5 rounded-full overflow-hidden"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      <div className="fingerprint-scanline" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-5 rounded-full"
                      animate={{ scale: [1, 1.06, 1], opacity: [0.45, 0.95, 0.45] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{
                        background:
                          'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.25), transparent 45%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.25), transparent 45%)'
                      }}
                    />
                  </>
                )}

                <Fingerprint className="fingerprint-icon relative z-10" />
              </div>
              <p className="text-sm text-muted-foreground text-center leading-tight px-4">{t('reveal.hold')}</p>
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

      <Button
        variant="ghost"
        className="w-full max-w-xs h-12 text-sm justify-center gap-2 text-muted-foreground hover:text-foreground"
        onClick={handleExit}
      >
        <Home className="w-4 h-4" />
        {t('discussion.exit')}
      </Button>
    </div>
  );
}
