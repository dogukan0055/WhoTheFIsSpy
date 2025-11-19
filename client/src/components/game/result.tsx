import React from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, MapPin, RotateCcw, Home, ScanFace } from 'lucide-react';
import { Link } from 'wouter';
import { playSound } from '@/lib/audio';

export default function Result() {
  const { state, dispatch } = useGame();
  const winner = state.gameData.winner;

  React.useEffect(() => {
    playSound('success');
  }, []);

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
          <h2 className="text-sm uppercase tracking-[0.5em] text-muted-foreground">Winner</h2>
          <h1 className={`text-5xl font-black font-mono uppercase ${winner === 'spy' ? 'text-red-500' : 'text-blue-500'}`}>
            {winner === 'spy' ? 'SPIES' : 'CIVILIANS'}
          </h1>
        </div>
      </motion.div>

      <div className="w-full max-w-sm bg-card/50 border border-border rounded-xl p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="text-muted-foreground text-sm">Secret Location</span>
          <div className="flex items-center text-foreground font-bold">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            {state.gameData.currentLocation}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase text-muted-foreground text-left mb-2">The Spies Were</h3>
          {state.players.filter(p => p.role === 'spy').map(spy => (
            <div key={spy.id} className="flex items-center bg-red-500/10 p-3 rounded border border-red-500/20">
              <ScanFace className="w-4 h-4 mr-2 text-red-500" />
              <span className="font-mono font-bold text-red-400">{spy.name}</span>
              {spy.isDead && <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">CAUGHT</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full gap-3 max-w-xs">
        <Button size="lg" onClick={() => { playSound('click'); dispatch({ type: 'RESET_GAME' }); }}>
          <RotateCcw className="mr-2 w-4 h-4" />
          Play Again
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full" onClick={() => playSound('click')}>
            <Home className="mr-2 w-4 h-4" />
            Back to Menu
          </Button>
        </Link>
      </div>
    </div>
  );
}
