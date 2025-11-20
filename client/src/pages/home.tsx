import React from 'react';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useGame } from '@/lib/game-context';
import { KeyRound, Wifi, MonitorSmartphone, HelpCircle, Settings, VenetianMask } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { playSound } from '@/lib/audio';

export default function Home() {
  const { dispatch } = useGame();

  const handleModeSelect = (mode: 'offline' | 'online') => {
    dispatch({ type: 'SET_MODE', payload: mode });
    playSound('click');
  };

  return (
    <Layout className="justify-center space-y-12">
      <div className="absolute top-4 right-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon" onClick={() => playSound('click')}>
            <Settings className="w-6 h-6 text-muted-foreground hover:text-foreground" />
          </Button>
        </Link>
      </div>

      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-block p-4 rounded-full bg-primary/10 border border-primary/20 mb-4 ring-4 ring-primary/5">
          <VenetianMask className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl font-black font-mono tracking-tighter text-foreground">
          WHO THE <span className="text-primary italic">F***</span><br/>IS SPY?
        </h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Deception, deduction, and betrayal. Can you find the impostor among us?
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-xs mx-auto">
        <Link href="/setup" onClick={() => handleModeSelect('offline')}>
          <Button size="lg" className="w-full h-16 text-lg font-bold font-mono tracking-wide relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <MonitorSmartphone className="mr-3 w-6 h-6" />
            OFFLINE MODE
          </Button>
        </Link>
        
        <Link href="/online-menu" onClick={() => handleModeSelect('online')}>
          <Button variant="secondary" size="lg" className="w-full h-16 text-lg font-bold font-mono tracking-wide opacity-80">
            <Wifi className="mr-3 w-6 h-6" />
            ONLINE MODE
          </Button>
        </Link>
      </div>

      <div className="text-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => playSound('click')}>
              <HelpCircle className="mr-2 w-4 h-4" />
              How to Play
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-mono font-bold text-primary">MISSION BRIEFING</DialogTitle>
              <DialogDescription>
                Classified Information. Read carefully.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-bold text-foreground mb-1">OBJECTIVE</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li><strong className="text-blue-400">Civilians:</strong> Find the Spy. Ask questions to prove you know the location.</li>
                  <li><strong className="text-red-400">Spy:</strong> Blend in. Figure out the location. Don't get caught.</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-1">GAMEPLAY</h3>
                <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                  <li>Pass the phone around to reveal roles.</li>
                  <li>Once everyone knows their role, start the timer.</li>
                  <li>Take turns asking Yes/No questions.</li>
                  <li>If you suspect someone, call a vote!</li>
                </ol>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-1">WIN CONDITIONS</h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li><strong>Spy Wins if:</strong> A civilian is eliminated (unless there are multiple spies), or if spies outnumber civilians, or if timer runs out.</li>
                  <li><strong>Civilians Win if:</strong> All spies are eliminated.</li>
                </ul>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground/30 font-mono">
        v1.1.0-PROTO // MOCKUP_MODE
      </footer>
    </Layout>
  );
}
