import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe2, Lock, Loader2, Wifi } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { onlineApi } from "@/lib/online-api";
import { useOnlineProfile } from "@/hooks/use-online-profile";

type Step = "identify" | "menu";

export default function OnlineMenu() {
  const { profile, setProfile } = useOnlineProfile();
  const [step, setStep] = useState<Step>(profile ? "menu" : "identify");
  const [name, setName] = useState(profile?.name ?? "");
  const [roomCode, setRoomCode] = useState("");
  const [spyCount, setSpyCount] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (profile) {
      setStep("menu");
      setName(profile.name);
    }
  }, [profile]);

  const connect = async () => {
    if (!name.trim()) {
      toast({
        title: "Pick a codename",
        description: "Name must be at least 2 characters.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      const session = await onlineApi.login(name.trim());
      setProfile(session);
      setStep("menu");
      toast({ title: "Connected", description: "Secure uplink established." });
    } catch (err: any) {
      toast({
        title: "Connection failed",
        description: err?.message ?? "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hostRoom = async () => {
    if (!name.trim()) {
      toast({
        title: "Pick a codename",
        description: "Name must be at least 2 characters.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      const session = profile ?? (await onlineApi.login(name.trim()));
      setProfile(session);
      const room = await onlineApi.createRoom(session, {
        spyCount,
        timerMinutes,
      });
      navigate(`/online/${room.code}`);
    } catch (err: any) {
      toast({
        title: "Couldn't create room",
        description: err?.message ?? "Please retry.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomCode || roomCode.length < 3) {
      toast({
        title: "Invalid code",
        description: "Room codes look like ABCD.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      const session = profile ?? (await onlineApi.login(name.trim() || "Agent"));
      setProfile(session);
      const room = await onlineApi.joinRoom(session, roomCode.trim().toUpperCase());
      navigate(`/online/${room.code}`);
    } catch (err: any) {
      toast({
        title: "Join failed",
        description: err?.message ?? "Check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout className="space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            Online Ops
          </div>
          <div className="text-2xl font-black font-mono">Network Lobby</div>
        </div>
      </div>

      {step === "identify" && (
        <Card className="p-6 space-y-4 bg-card/50 border-white/10">
          <div className="text-center space-y-1">
            <Wifi className="w-10 h-10 mx-auto text-primary animate-pulse" />
            <div className="text-lg font-semibold font-mono">Identify yourself</div>
            <p className="text-sm text-muted-foreground">
              Choose a codename before entering secure rooms.
            </p>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cipher, Raven, Nova..."
            className="text-center h-12 text-lg font-mono"
            maxLength={20}
          />
          <Button className="w-full h-12" onClick={connect} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Establish uplink"}
          </Button>
        </Card>
      )}

      {step === "menu" && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3 bg-card/40 border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5" />
                <div>
                  <div className="text-sm font-semibold">Host a room</div>
                  <p className="text-xs text-muted-foreground">
                    Share the code with friends. You control settings.
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{profile?.name ?? name || "Anon"}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Spies
                </label>
                <Input
                  type="number"
                  min={1}
                  max={2}
                  value={spyCount}
                  onChange={(e) => setSpyCount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Timer (min)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={25}
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                />
              </div>
            </div>
            <Button className="w-full h-12" onClick={hostRoom} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate room code"}
            </Button>
          </Card>

          <Card className="p-6 space-y-3 bg-card/40 border-white/5">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">Join a room</div>
                <p className="text-xs text-muted-foreground">
                  Got an invite code? Jump straight in.
                </p>
              </div>
            </div>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              className="text-center text-2xl font-mono tracking-[0.3em] h-14"
              maxLength={6}
            />
            <Button
              className="w-full h-12"
              variant="secondary"
              onClick={joinRoom}
              disabled={isLoading}
            >
              Enter room
            </Button>
          </Card>
        </div>
      )}

    </Layout>
  );
}
