import React, { useState } from 'react';
import { useGame, Player } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skull, Fingerprint, User } from 'lucide-react';

export default function Voting() {
  const { state, dispatch } = useGame();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const livingPlayers = state.players.filter(p => !p.isDead);

  const handleVote = () => {
    if (selectedPlayerId) {
      dispatch({ type: 'ELIMINATE_PLAYER', payload: selectedPlayerId });
    }
  };

  return (
    <div className="flex flex-col h-full py-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-mono text-red-500 uppercase tracking-widest animate-pulse">Emergency Meeting</h2>
        <p className="text-muted-foreground text-sm">Who is the most suspicious?</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 px-1">
        {livingPlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => setSelectedPlayerId(player.id)}
            className={cn(
              "w-full flex items-center p-4 rounded-lg border transition-all duration-200 group relative overflow-hidden",
              selectedPlayerId === player.id 
                ? "border-red-500 bg-red-500/10 ring-1 ring-red-500" 
                : "border-border bg-card hover:border-red-500/50 hover:bg-accent"
            )}
          >
             {/* Selection Indicator */}
             {selectedPlayerId === player.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
             )}

            <div className="h-10 w-10 mr-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
               <User className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="text-left flex-1">
              <p className={cn("font-bold font-mono truncate", selectedPlayerId === player.id && "text-red-400")}>
                {player.name}
              </p>
            </div>

            <Fingerprint className={cn("w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity", selectedPlayerId === player.id && "opacity-100 text-red-500")} />
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => dispatch({ type: 'START_PLAYING' })}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          className="flex-[2] font-bold"
          disabled={!selectedPlayerId}
          onClick={handleVote}
        >
          <Skull className="mr-2 w-4 h-4" />
          Eliminate
        </Button>
      </div>
    </div>
  );
}
