import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe2, Lock, Loader2, Wifi, User, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { onlineApi } from "@/lib/online-api";
import { useOnlineProfile } from "@/hooks/use-online-profile";
import { useTranslation } from "@/hooks/use-translation";

type Step = "identify" | "menu";

export default function OnlineMenu() {
  const { profile, setProfile } = useOnlineProfile();
  const [step, setStep] = useState<Step>(profile ? "menu" : "identify");
  const [name, setName] = useState(profile?.name ?? "");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (profile) {
      setStep("menu");
      setName(profile.name);
    }
  }, [profile]);

  const connect = async () => {
    if (!name.trim()) {
      toast({
        title: t("online.pickCodename"),
        description: t("online.pickCodenameDesc"),
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      const session = await onlineApi.login(name.trim());
      setProfile(session);
      setStep("menu");
      toast({ title: t("online.connected"), description: t("online.connectedDesc") });
    } catch (err: any) {
      toast({
        title: t("online.connectionFailed"),
        description: err?.message ?? t("online.connectionFailedDesc"),
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
    toast({ title: t("online.signedOut"), description: t("online.signedOutDesc") });
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
        title: t("online.pickCodename"),
        description: t("online.pickCodenameDesc"),
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
        title: t("online.cantCreateRoom"),
        description: err?.message ?? t("online.cantCreateRoomDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomCode || roomCode.length < 4) {
      toast({
        title: t("online.invalidCode"),
        description: t("online.invalidCodeDesc"),
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
        title: t("online.joinFailed"),
        description: err?.message ?? t("online.joinFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            {t("online.opsTag")}
          </div>
          <div className="text-2xl font-black font-mono">{t("online.lobbyTitle")}</div>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {profile.name}
            </Badge>
            <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{t("online.logout")}</span>
            </Button>
          </div>
        )}
      </div>

      {step === "identify" && (
        <Card className="p-6 space-y-4 bg-card/50 border-white/10">
          <div className="text-center space-y-1">
            <Wifi className="w-10 h-10 mx-auto text-primary animate-pulse" />
            <div className="text-lg font-semibold font-mono">{t("online.identifyTitle")}</div>
            <p className="text-sm text-muted-foreground">
              {t("online.identifySubtitle")}
            </p>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("online.codenamePlaceholder")}
            className="text-center h-12 text-lg font-mono"
            maxLength={20}
          />
          <Button className="w-full h-12" onClick={connect} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("online.establishLink")}
          </Button>
        </Card>
      )}

      {step === "menu" && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3 bg-card/40 border-white/5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">{t("online.hostRoomTitle")}</div>
                <p className="text-xs text-muted-foreground">{t("online.hostRoomDesc")}</p>
              </div>
            </div>
            <Button className="w-full h-12" onClick={hostRoom} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("online.generateCode")}
            </Button>
          </Card>

          <Card className="p-6 space-y-3 bg-card/40 border-white/5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">{t("online.joinRoomTitle")}</div>
                <p className="text-xs text-muted-foreground">{t("online.joinRoomDesc")}</p>
              </div>
            </div>
            <div className="space-y-2">
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
                {t("online.enterRoom")}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </Layout>
  );
}
