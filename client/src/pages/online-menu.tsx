import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Globe, Lock, Loader2, User, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type OnlineStep = 'name' | 'menu' | 'join' | 'lobby';

export default function OnlineMenu() {
  const [step, setStep] = useState<OnlineStep>('name');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fake Lobby Logic
  useEffect(() => {
    if (step === 'lobby') {
      // Add self
      setPlayers([name]);
      
      // Simulate players joining
      const interval = setInterval(() => {
        setPlayers(prev => {
          if (prev.length >= 4) return prev;
          const fakeNames = ['Agent 007', 'BlackWidow', 'Cipher', 'Neo', 'Trinity'];
          const nextName = fakeNames[prev.length];
          toast({ title: "Player Joined", description: `${nextName} has entered the safehouse.` });
          return [...prev, nextName];
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [step, name]);

  const handleConnect = () => {
    if (!name.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('menu');
    }, 1500);
  };

  const handleHost = () => {
    setIsHosting(true);
    setRoomCode(Math.random().toString(36).substring(7).toUpperCase());
    setStep('lobby');
  };

  const handleJoin = () => {
    setStep('join');
  };

  const handleJoinSubmit = () => {
    if (roomCode.length !== 4) {
       toast({ title: "Error", description: "Invalid Room Code", variant: "destructive" });
       return;
    }
    setIsHosting(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('lobby');
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-mono ml-2">ONLINE OPS</h1>
      </div>

      {/* STEP 1: NAME */}
      {step === 'name' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <Globe className="w-12 h-12 mx-auto text-primary mb-4 animate-pulse" />
            <h2 className="text-xl font-bold font-mono">IDENTIFY YOURSELF</h2>
            <p className="text-muted-foreground text-sm">Enter your codename to access the encrypted network.</p>
          </div>
          <div className="space-y-4">
             <Input 
                placeholder="Codename" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="text-center font-mono text-lg h-12"
                maxLength={12}
             />
             <Button className="w-full h-12 font-bold" onClick={handleConnect} disabled={isLoading || !name}>
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ESTABLISH UPLINK"}
             </Button>
          </div>
        </div>
      )}

      {/* STEP 2: MENU */}
      {step === 'menu' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center justify-center gap-2 text-sm font-mono text-green-500 mb-8">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             CONNECTED AS: {name.toUpperCase()}
           </div>

           <div className="grid gap-4">
            <Button className="h-24 flex flex-col gap-2 text-lg border-primary/50 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary" variant="outline" onClick={handleHost}>
              <Globe className="w-8 h-8" />
              CREATE OPERATION
              <span className="text-xs opacity-60 font-normal">Host a new game lobby</span>
            </Button>
            <Button className="h-24 flex flex-col gap-2 text-lg" variant="secondary" onClick={handleJoin}>
              <Lock className="w-8 h-8" />
              JOIN OPERATION
              <span className="text-xs opacity-60 font-normal">Enter an existing room code</span>
            </Button>
           </div>
        </div>
      )}

      {/* STEP 3: JOIN INPUT */}
      {step === 'join' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm">
            <h2 className="text-center font-bold font-mono text-xl">ENTER ACCESS CODE</h2>
            <Input 
              placeholder="XXXX" 
              className="text-center text-3xl tracking-[0.5em] font-mono h-16 uppercase"
              maxLength={4}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <Button className="w-full h-12" onClick={handleJoinSubmit} disabled={isLoading}>
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ACCESS MAINFRAME"}
            </Button>
          </Card>
        </div>
      )}

      {/* STEP 4: LOBBY */}
      {step === 'lobby' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="text-center">
             <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Operation Code</p>
             <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-black font-mono tracking-wider text-primary">{roomCode || "XJ9T"}</span>
                <Button size="icon" variant="ghost" onClick={() => {
                  navigator.clipboard.writeText(roomCode || "XJ9T");
                  toast({ title: "Copied", description: "Code copied to clipboard" });
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
             </div>
           </div>

           <div className="space-y-3">
             <div className="flex justify-between items-end border-b border-white/10 pb-2">
               <span className="text-sm font-bold">AGENTS ({players.length}/8)</span>
               {players.length < 4 && <span className="text-xs text-yellow-500 animate-pulse">Waiting for agents...</span>}
               {players.length >= 4 && <span className="text-xs text-green-500">Ready to deploy</span>}
             </div>
             
             <div className="grid gap-2">
               {players.map((p, i) => (
                 <div key={i} className="flex items-center bg-card/30 p-3 rounded border border-white/5 animate-in fade-in slide-in-from-left-2">
                   <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center mr-3 text-primary">
                     <User className="w-4 h-4" />
                   </div>
                   <span className="font-mono">{p}</span>
                   {i === 0 && <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">HOST</span>}
                 </div>
               ))}
               {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center p-3 rounded border border-dashed border-white/10 opacity-50">
                    <div className="w-8 h-8 rounded bg-white/5 mr-3 animate-pulse" />
                    <span className="font-mono text-muted-foreground text-xs">Searching Signal...</span>
                  </div>
               ))}
             </div>
           </div>

           {isHosting && (
             <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/5">
               <div className="max-w-md mx-auto">
                 <Button size="lg" className="w-full h-14 font-bold" disabled={players.length < 4} onClick={() => toast({ title: "Demo Mode", description: "This is a UI prototype. Game start simulation complete." })}>
                   START MISSION
                 </Button>
               </div>
             </div>
           )}
        </div>
      )}

    </Layout>
  );
}
