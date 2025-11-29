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

  const logout = () => {
    setProfile(null);
    setStep("identify");
    setName("");
    setRoomCode("");
    toast({ title: "Signed out", description: "Session cleared." });
  };

  const ensureSession = async () => {
    const codename = (profile?.name ?? name).trim() || "Agent";
    const fresh = await onlineApi.login(codename);
    setProfile(fresh);
    return fresh;
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
      let session = profile ?? (await ensureSession());
      try {
        const room = await onlineApi.createRoom(session, {});
        navigate(`/online/${room.code}`);
        return;
      } catch (err: any) {
        if (typeof err?.message === "string" && err.message.startsWith("401")) {
          session = await ensureSession();
          const room = await onlineApi.createRoom(session, {});
          navigate(`/online/${room.code}`);
          return;
        }
        throw err;
      }
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
    if (!roomCode || roomCode.length < 4) {
      toast({
        title: "Invalid code",
        description: "Room codes look like ABCD.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      let session = profile ?? (await ensureSession());
      const code = roomCode.trim().toUpperCase();
      try {
        const room = await onlineApi.joinRoom(session, code);
        navigate(`/online/${room.code}`);
        return;
      } catch (err: any) {
        if (typeof err?.message === "string" && err.message.startsWith("401")) {
          session = await ensureSession();
          const room = await onlineApi.joinRoom(session, code);
          navigate(`/online/${room.code}`);
          return;
        }
        throw err;
      }
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
        {profile && (
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        )}
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
                    Share the code with friends. Configure details inside the lobby.
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{(profile?.name ?? name) || "Anon"}</Badge>
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
              maxLength={4}
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
