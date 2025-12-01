import React from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, MapPin, RotateCcw, Home, Fingerprint, Settings } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { playSound } from '@/lib/audio';
import { useTranslation } from '@/hooks/use-translation';
import { getLocationName } from '@/lib/location-i18n';

export default function Result() {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const winner = state.gameData.winner;
  const [countdown, setCountdown] = React.useState(10);

  const availableLocations = React.useMemo(() => {
    const cats = state.gameData.categories
      .filter(c => state.settings.selectedCategories.includes(c.id))
      .map(c => ({
        ...c,
        enabled: c.locations.filter(loc => !(state.settings.disabledLocations[c.id] || []).includes(loc))
      }))
      .filter(c => c.enabled.length > 0);
    let pool = cats.flatMap(c => c.enabled);
    if (state.settings.noRepeatLocations) {
      pool = pool.filter(loc => !state.gameData.usedLocations.includes(loc));
    }
    return pool;
  }, [state.gameData.categories, state.settings.selectedCategories, state.settings.disabledLocations, state.settings.noRepeatLocations, state.gameData.usedLocations]);

  const hasLocationsLeft = !state.settings.noRepeatLocations || availableLocations.length > 0;

  React.useEffect(() => {
    playSound('success');
  }, []);

  React.useEffect(() => {
    if (!hasLocationsLeft) return;
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasLocationsLeft]);

  React.useEffect(() => {
    if (hasLocationsLeft && countdown === 0) {
      dispatch({ type: 'START_NEW_ROUND' });
    }
  }, [countdown, dispatch, hasLocationsLeft]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-6"
      >
        <div className="relative">
           <Trophy className={`w-24 h-24 mx-auto ${winner === 'spy' ? 'text-red-500' : 'text-blue-500'}`} />
           <div className={`absolute inset-0 blur-2xl opacity-50 ${winner === 'spy' ? 'bg-red-500' : 'bg-blue-500'}`} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-sm uppercase tracking-[0.5em] text-muted-foreground">{t('result.winner')}</h2>
          <h1 className={`text-5xl font-black font-mono uppercase ${winner === 'spy' ? 'text-red-500' : 'text-blue-500'}`}>
            {winner === 'spy' ? t('result.spies') : t('result.civilians')}
          </h1>
        </div>
      </motion.div>

      <div className="w-full max-w-sm bg-card/50 border border-border rounded-xl p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="text-muted-foreground text-sm">{t('result.secretLocation')}</span>
          <div className="flex items-center text-foreground font-bold">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            {getLocationName(state.appSettings.language, state.gameData.currentLocation)}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase text-muted-foreground text-left mb-2">{t('result.spiesWere')}</h3>
          {state.players.filter(p => p.role === 'spy').map(spy => (
            <div key={spy.id} className="flex items-center bg-red-500/10 p-3 rounded border border-red-500/20">
              <Fingerprint className="w-4 h-4 mr-2 text-red-500" />
              <span className="font-mono font-bold text-red-400">{spy.name}</span>
              {spy.isDead && <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{t('result.caught')}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full gap-3 max-w-xs">
        <Button
          size="lg"
          disabled={!hasLocationsLeft}
          onClick={() => { playSound('click'); if (!hasLocationsLeft) return; dispatch({ type: 'START_NEW_ROUND' }); }}>
          <RotateCcw className="mr-2 w-4 h-4" />
          {t('result.playAgain')}
        </Button>
        {hasLocationsLeft ? (
          <div className="text-xs text-muted-foreground text-center">
            {t('result.nextRound')} {countdown}s
          </div>
        ) : (
          <div className="text-xs text-destructive text-center">
            {t('setup.noLocationsLeft')}
          </div>
        )}
        <Button
          size="lg"
          variant="secondary"
          onClick={() => {
            playSound('click');
            navigate('/locations');
          }}
        >
          <Settings className="mr-2 w-4 h-4" />
          {t('result.changeSettings')}
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full" onClick={() => playSound('click')}>
            <Home className="mr-2 w-4 h-4" />
            {t('result.backMenu')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
