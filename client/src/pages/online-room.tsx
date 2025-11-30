import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useOnlineProfile } from "@/hooks/use-online-profile";
import {
  onlineApi,
  type OnlineRoomState,
  type OnlinePlayer,
  type OnlineProfile,
} from "@/lib/online-api";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Copy,
  Loader2,
  MessageSquare,
  Play,
  Send,
  ShieldQuestion,
  User,
  TimerReset,
  Vote,
  Share2,
} from "lucide-react";
import { NumberPicker } from "@/components/ui/number-picker";
import { Switch } from "@/components/ui/switch";
import { INITIAL_CATEGORIES } from "@/lib/locations";

type OnlineRoomProps = {
  params: { code: string };
};

export default function OnlineRoom({ params }: OnlineRoomProps) {
  const code = params.code.toUpperCase();
  const { profile, setProfile } = useOnlineProfile();
  const [, navigate] = useLocation();
  const [room, setRoom] = useState<OnlineRoomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [chatInput, setChatInput] = useState("");
  const [targetId, setTargetId] = useState<string | undefined>(undefined);
  const [voteTarget, setVoteTarget] = useState<string | undefined>(undefined);
  const [settingsDraft, setSettingsDraft] = useState({
    spyCount: 1,
    timerMinutes: 10,
    locations: "",
  });
  const [settingsDirty, setSettingsDirty] = useState(false);
  const settingsDirtyRef = React.useRef(settingsDirty);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    INITIAL_CATEGORIES.map((c) => c.id),
  );
  const [locationPicks, setLocationPicks] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        INITIAL_CATEGORIES.map((c) => [c.id, [...c.locations]]),
      ),
  );

  useEffect(() => {
    settingsDirtyRef.current = settingsDirty;
  }, [settingsDirty]);

  useEffect(() => {
    if (!profile) {
      navigate("/online-menu");
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    const tick = setInterval(() => setNow(Date.now()), 1000);

    const fetchState = async () => {
      try {
        const next = await onlineApi.getState(profile, code);
        if (!active) return;
        setRoom(next);
        setIsLoading(false);
        if (!settingsDirtyRef.current) {
          // Derive which categories are active based on server locations, fall back to all
          const activeCats = INITIAL_CATEGORIES.filter((c) =>
            c.locations.some((loc) => next.settings.locations.includes(loc)),
          ).map((c) => c.id);
          setSelectedCategories(activeCats.length ? activeCats : INITIAL_CATEGORIES.map((c) => c.id));
          setSettingsDraft({
            spyCount: next.settings.spyCount,
            timerMinutes: next.settings.timerMinutes,
            locations: next.settings.locations.join(", "),
          });
          setLocationPicks(
            Object.fromEntries(
              INITIAL_CATEGORIES.map((c) => [
                c.id,
                c.locations.filter((loc) => next.settings.locations.includes(loc)),
              ]),
            ),
          );
        }
      } catch (err: any) {
        if (!active) return;
        setIsLoading(false);
        if (typeof err?.message === "string" && err.message.startsWith("401")) {
          const fresh = await reauthAndRejoin();
          if (!fresh) return;
          return;
        }
        toast({
          title: "Connection lost",
          description: err?.message ?? "Unable to load room state.",
          variant: "destructive",
        });
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1200);
    return () => {
      active = false;
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [profile, code]);

  const reauthAndRejoin = async () => {
    if (!profile) return null;
    try {
      const fresh = await onlineApi.login(profile.name);
      setProfile(fresh);
      const rejoined = await onlineApi.joinRoom(fresh, code);
      setRoom(rejoined);
      toast({ title: "Session refreshed", description: "Rejoined the room." });
      return fresh;
    } catch (e: any) {
      setProfile(null);
      navigate("/online-menu");
      toast({
        title: "Re-auth needed",
        description: e?.message ?? "Session expired. Rejoin with your codename.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handle = async (
    fn: (prof: OnlineProfile) => Promise<OnlineRoomState | void>,
  ) => {
    if (!profile) return;
    let currentProfile = profile;
    try {
      const next = await fn(currentProfile);
      if (next) {
        setRoom(next);
      }
    } catch (err: any) {
      if (typeof err?.message === "string" && err.message.startsWith("401")) {
        const fresh = await reauthAndRejoin();
        if (!fresh) return;
        currentProfile = fresh;
        try {
          const retryNext = await fn(currentProfile);
          if (retryNext) setRoom(retryNext);
          return;
        } catch (innerErr: any) {
          toast({
            title: "Action failed",
            description: innerErr?.message ?? "Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      toast({
        title: "Action failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: `Room code ${code} copied.` });
  };

  const me: OnlinePlayer | undefined = useMemo(() => {
    if (!room || !profile) return undefined;
    return room.players.find((p) => p.id === profile.playerId);
  }, [room, profile]);

  const timeLeft = useMemo(() => {
    if (!room?.timerEndsAt) return null;
    const ms = Math.max(0, room.timerEndsAt - now);
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, [room?.timerEndsAt, now]);

  const revealCountdown = useMemo(() => {
    if (!room?.revealEndsAt) return null;
    return Math.max(0, Math.ceil((room.revealEndsAt - now) / 1000));
  }, [room?.revealEndsAt, now]);

  const voteCountdown = useMemo(() => {
    if (!room?.voteEndsAt) return null;
    return Math.max(0, Math.ceil((room.voteEndsAt - now) / 1000));
  }, [room?.voteEndsAt, now]);

  useEffect(() => {
    if (room?.closedReason) {
      toast({
        title: "Room closed",
        description: room.closedReason,
        variant: "destructive",
      });
      setTimeout(() => navigate("/online-menu"), 1200);
    }
  }, [room?.closedReason, navigate]);
  const [finishCountdown, setFinishCountdown] = useState(10);
  useEffect(() => {
    if (!room || room.phase !== "finished") return;
    setFinishCountdown(10);
    const t = setInterval(() => {
      setFinishCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [room?.phase]);

  const readyCount = room?.players.filter((p) => p.isReady).length ?? 0;

  const renderPlayers = () => (
    <Card className="p-4 space-y-3 bg-card/40 border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Agents</h3>
        <Badge variant="secondary">
          {room?.players.length ?? 0}/8 enlisted
        </Badge>
      </div>
      <div className="space-y-2">
        {room?.players.map((p) => (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2",
              p.eliminated && "opacity-50"
            )}
          >
            <div className="flex-1">
              <div className="font-mono text-sm">{p.name}</div>
              <div className="text-[11px] text-muted-foreground flex gap-2">
                {p.isHost && <Badge variant="outline" className="text-[10px] border-primary/60 text-primary">HOST</Badge>}
                {p.isReady && room?.phase === "lobby" && <span>Ready</span>}
                {p.eliminated && <span>Eliminated</span>}
              </div>
            </div>
            {room?.phase === "lobby" && p.isReady && (
              <Badge className="bg-emerald-500/20 text-emerald-200">
                Ready
              </Badge>
            )}
            {room?.phase === "lobby" && !p.isReady && (
              <Badge variant="outline">Waiting</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );

  const renderLobby = () => (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-4 space-y-3 bg-card/40 border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase text-muted-foreground font-mono">Game Settings</div>
            <h3 className="text-lg font-semibold">Curate safehouses</h3>
            <p className="text-xs text-muted-foreground">
              Toggle categories, disable risky spots, or add custom hideouts.
            </p>
          </div>
          <Badge variant="secondary">Host only</Badge>
        </div>
        <div className="space-y-3">
          <label className="text-xs text-muted-foreground font-mono">
            Spy Count (1-2)
          </label>
          <NumberPicker
            min={1}
            max={2}
            value={settingsDraft.spyCount}
            onChange={(val) => {
              if (!me?.isHost) return;
              setSettingsDirty(true);
              setSettingsDraft((prev) => ({ ...prev, spyCount: val }));
            }}
          />
          <label className="text-xs text-muted-foreground font-mono">
            Round Timer (minutes)
          </label>
          <NumberPicker
            min={5}
            max={25}
            value={settingsDraft.timerMinutes}
            onChange={(val) => {
              if (!me?.isHost) return;
              setSettingsDirty(true);
              setSettingsDraft((prev) => ({ ...prev, timerMinutes: val }));
            }}
          />
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-mono">
              Game Settings (Host Only)
            </label>
            <div className="flex gap-3">
              <div className="flex-1 space-y-3">
                {INITIAL_CATEGORIES.map((cat) => {
                  const enabled = selectedCategories.includes(cat.id);
                  const picks = locationPicks[cat.id] ?? [];
                  return (
                    <div
                      key={cat.id}
                      className={cn(
                        "rounded border px-3 py-2 space-y-2",
                        enabled
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-white/10 bg-background/40 text-muted-foreground",
                        !me?.isHost && "opacity-60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{cat.name}</span>
                        <Switch
                          checked={enabled}
                          disabled={!me?.isHost}
                          onCheckedChange={() => {
                            if (!me?.isHost) return;
                            setSettingsDirty(true);
                            setSelectedCategories((prev) =>
                              prev.includes(cat.id)
                                ? prev.filter((id) => id !== cat.id)
                                : [...prev, cat.id],
                            );
                            if (!enabled && picks.length === 0) {
                              setLocationPicks((prev) => ({
                                ...prev,
                                [cat.id]: [...cat.locations],
                              }));
                            }
                            if (enabled) {
                              setLocationPicks((prev) => ({
                                ...prev,
                                [cat.id]: [],
                              }));
                            }
                          }}
                        />
                      </div>
                      {enabled && (
                        <div className="flex flex-wrap gap-2">
                          {cat.locations.map((loc) => {
                            const on = picks.includes(loc);
                            return (
                              <button
                                key={loc}
                                disabled={!me?.isHost}
                                onClick={() => {
                                  if (!me?.isHost) return;
                                  setSettingsDirty(true);
                                  setLocationPicks((prev) => {
                                    const existing = prev[cat.id] ?? [];
                                    const next = on
                                      ? existing.filter((l) => l !== loc)
                                      : [...existing, loc];
                                    return { ...prev, [cat.id]: next };
                                  });
                                }}
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs border",
                                  on
                                    ? "border-primary bg-primary/20 text-primary-foreground"
                                    : "border-white/10 bg-background/60 text-muted-foreground",
                                )}
                              >
                                {loc}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Card className="w-48 p-3 border-white/10 bg-background/50 hidden md:block">
                <div className="text-xs uppercase text-muted-foreground">Roster (host)</div>
                <div className="space-y-2 mt-2">
                  {room?.players.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <span className="truncate">{p.name}</span>
                      {p.isHost && <Badge variant="secondary">HOST</Badge>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Matches offline database: toggle categories and individual locations.
            </p>
          </div>
          {me?.isHost && (
            <Button
              className="w-full"
              onClick={() =>
                handle(async () => {
                  const selectedLocs =
                    selectedCategories.length > 0
                      ? selectedCategories.flatMap((catId) => {
                          const cat = INITIAL_CATEGORIES.find((c) => c.id === catId);
                          if (!cat) return [];
                          const picks = locationPicks[catId]?.filter((l) => cat.locations.includes(l)) ?? [];
                          return picks.length > 0 ? picks : cat.locations;
                        })
                      : INITIAL_CATEGORIES.flatMap((c) => c.locations);
                  const filteredLocs = Array.from(new Set(selectedLocs));
                  if (filteredLocs.length === 0) {
                    toast({
                      title: "No locations selected",
                      description: "Enable at least one location to start.",
                      variant: "destructive",
                    });
                    return undefined;
                  }
                  const chosenLocations =
                    filteredLocs.length > 0
                      ? filteredLocs
                      : settingsDraft.locations
                          .split(",")
                          .map((loc) => loc.trim())
                          .filter(Boolean);
                  const updated = await onlineApi.updateSettings(profile!, code, {
                    spyCount: settingsDraft.spyCount,
                    timerMinutes: settingsDraft.timerMinutes,
                    locations: chosenLocations.length
                      ? chosenLocations
                      : INITIAL_CATEGORIES.flatMap((c) => c.locations),
                  });
                  toast({ title: "Settings saved", description: "Lobby updated." });
                  setSettingsDirty(false);
                  return updated;
                })
              }
            >
              Save Settings
            </Button>
          )}
        </div>
      </Card>
      <div className="space-y-3">
        {renderPlayers()}
        <Card className="p-4 flex flex-col gap-2 bg-card/40 border-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">
              Ready up ({readyCount}/{room?.players.length ?? 0})
            </div>
            <Badge variant="secondary">Min 4 to start</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant={me?.isReady ? "secondary" : "default"}
              onClick={() =>
                handle((prof) =>
                  onlineApi.setReady(prof, code, !(me?.isReady ?? false)),
                )
              }
            >
              {me?.isReady ? "I'm not ready" : "I'm ready"}
            </Button>
            {me?.isHost && (
              <Button
                disabled={!room || readyCount < 4}
                onClick={() => handle((prof) => onlineApi.start(prof, code))}
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderReveal = () => (
    <Card className="p-8 bg-gradient-to-br from-primary/10 via-card/70 to-background border border-primary/30 text-center space-y-4">
      <div className="text-xs text-muted-foreground uppercase tracking-widest">
        Reveal Phase
      </div>
      <div className="text-4xl font-black font-mono">
        {room?.yourRole === "spy" ? "YOU ARE A SPY" : "You are a civilian"}
      </div>
      {room?.yourRole === "civilian" && (
        <div className="text-muted-foreground">
          <div className="text-xs uppercase tracking-widest">Location</div>
          <div className="text-2xl font-semibold">{room.location}</div>
        </div>
      )}
      <div className="text-6xl font-black font-mono text-primary drop-shadow">
        {revealCountdown ?? 0}s
      </div>
      <p className="text-sm text-muted-foreground">
        Cards will hide automatically when the timer ends.
      </p>
    </Card>
  );

  const currentTurn = room?.turn;
  const currentAsker = room?.players.find(
    (p) => p.id === currentTurn?.askerId,
  );
  const currentTarget = room?.players.find(
    (p) => p.id === currentTurn?.targetId,
  );

  const renderTurnControls = () => {
    if (!room || !currentTurn) return null;

    if (currentTurn.status === "awaiting-question" && me?.id === currentTurn.askerId) {
      return (
        <Card className="p-4 space-y-3 bg-card/40 border-white/5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldQuestion className="w-4 h-4" />
            Your turn to ask
          </div>
          <div className="text-xs text-muted-foreground">
            Choose a target and ask a yes/no question.
          </div>
          <div className="text-4xl font-black font-mono text-primary">
            {Math.ceil((currentTurn.remainingMs ?? 0) / 1000)}s
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase">Choose a target</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {room.players
                .filter((p) => !p.eliminated && p.id !== me?.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setTargetId(p.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded border text-left",
                      targetId === p.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 bg-background/60 text-foreground",
                    )}
                  >
                    <span>{p.name}</span>
                    <Badge variant="secondary">Target</Badge>
                  </button>
                ))}
            </div>
          </div>
          <div className="text-sm font-mono bg-background/60 border border-white/10 rounded px-3 py-2">
            Is this place ...?
          </div>
          <Button
            disabled={!targetId}
            onClick={() =>
              handle((prof) =>
                onlineApi.askQuestion(
                  prof,
                  code,
                  targetId!,
                  "Is this place ...?",
                ),
              )
            }
          >
            Send question
          </Button>
        </Card>
      );
    }

    if (
      currentTurn.status === "awaiting-answer" &&
      me?.id === currentTurn.targetId
    ) {
      return (
        <Card className="p-4 space-y-3 bg-card/40 border-white/5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldQuestion className="w-4 h-4" />
            You must answer
          </div>
          <div className="text-xs text-muted-foreground">
            {currentAsker?.name} asked:{" "}
            <span className="font-semibold">{currentTurn.question}</span>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => handle((prof) => onlineApi.answer(prof, code, "yes"))}
            >
              Yes
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => handle((prof) => onlineApi.answer(prof, code, "no"))}
            >
              No
            </Button>
          </div>
          <div className="text-4xl font-black font-mono text-primary">
            {Math.ceil((currentTurn.remainingMs ?? 0) / 1000)}s
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-4 bg-card/30 border-white/5">
        <div className="text-sm font-semibold flex items-center gap-2">
          <ShieldQuestion className="w-4 h-4" />
          {currentTurn.status === "awaiting-question"
            ? `${currentAsker?.name ?? "Someone"} is picking a target...`
            : `${currentTarget?.name ?? "Player"} is answering...`}
        </div>
        <div className="text-4xl font-black font-mono text-primary">
          {Math.ceil((currentTurn.remainingMs ?? 0) / 1000)}s
        </div>
      </Card>
    );
  };

  const renderChat = () => (
    <Card className="p-4 bg-card/40 border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="w-4 h-4" />
          Squad feed
        </div>
        <Button variant="ghost" size="icon" onClick={() => setChatInput("Thanks for the intel.")}>
          <TimerReset className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-[240px] max-h-[320px] overflow-y-auto space-y-2 pr-1">
        {room?.chat.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "text-sm p-2 rounded border border-white/5",
              msg.system ? "text-muted-foreground bg-white/5" : "bg-background/40",
            )}
          >
            <div className="text-[11px] text-muted-foreground mb-1">
              {msg.system ? "SYSTEM" : msg.senderName ?? "Player"} ·{" "}
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
            <div className="font-mono">{msg.message}</div>
          </div>
        ))}
      </div>
      {room?.phase === "voting" && (
        <div className="flex gap-2 mt-3">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Send intel to everyone"
          />
          <Button
            onClick={() => {
              if (!chatInput.trim()) return;
              handle((prof) => onlineApi.chat(prof, code, chatInput.trim()));
              setChatInput("");
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );

  const renderVoting = () => (
    <Card className="p-4 space-y-3 bg-card/40 border border-amber-500/40">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Vote className="w-4 h-4" />
        Vote in progress
      </div>
      <div className="text-xs text-muted-foreground">
        Use chat for {voteCountdown ?? 0}s then lock your choice.
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {room?.players
          .filter((p) => !p.eliminated)
          .map((p) => (
            <button
              key={p.id}
              onClick={() => setVoteTarget(p.id)}
              className={cn(
                "px-3 py-2 rounded border text-left flex items-center justify-between",
                voteTarget === p.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 bg-background/60 text-foreground",
              )}
            >
              <span>{p.name}</span>
              {voteTarget === p.id && <Badge variant="secondary">Selected</Badge>}
            </button>
          ))}
      </div>
      <Button
        disabled={!voteTarget}
        onClick={() =>
          handle((prof) => onlineApi.vote(prof, code, voteTarget!))
        }
      >
        Confirm vote
      </Button>
      {room?.lastVote?.message && (
        <div className="text-xs text-muted-foreground">{room.lastVote.message}</div>
      )}
    </Card>
  );

  const renderInGame = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-4 space-y-2 bg-card/40 border-white/5">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            Your Brief
          </div>
          <div className="text-xl font-black font-mono">
            {room?.yourRole === "spy" ? "SPY" : "CIVILIAN"}
          </div>
          {room?.yourRole === "civilian" && (
            <p className="text-sm text-muted-foreground">Location: {room?.location}</p>
          )}
          <div className="flex gap-2">
            <Badge>{room?.spiesRemaining ?? 0} spies active</Badge>
            {me?.lockedOutOfAsking && (
              <Badge variant="destructive">Cannot ask</Badge>
            )}
          </div>
        </Card>
        <Card className="p-4 space-y-2 bg-card/40 border-white/5 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            Mission Timer
          </div>
          <div className="text-3xl font-black font-mono">{timeLeft ?? "--:--"}</div>
          <div className="text-xs text-muted-foreground">
            Runs out? Spies win.
          </div>
        </Card>
        <Card className="p-4 space-y-2 bg-card/40 border-white/5 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            Actions
          </div>
          <Button
            variant="destructive"
            disabled={room?.phase !== "playing" || me?.calledVote}
            onClick={() => handle((prof) => onlineApi.callVote(prof, code))}
          >
            <Vote className="w-4 h-4 mr-2" />
            Call vote
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              handle((prof) => onlineApi.leave(prof, code));
              setProfile(null);
              navigate("/online-menu");
            }}
          >
            Leave room
          </Button>
        </Card>
      </div>

      {currentTurn && renderTurnControls()}

      {room?.phase === "voting" ? (
        renderVoting()
      ) : (
        <div className="grid md:grid-cols-3 gap-3 items-start">
          <div className="md:col-span-2">{renderChat()}</div>
          <div className="space-y-3">
            {renderPlayers()}
            <Card className="p-4 bg-card/40 border-white/5">
              <div className="text-xs uppercase text-muted-foreground">Settings</div>
              <div className="text-sm">Spies: {room?.settings.spyCount}</div>
              <div className="text-sm">Timer: {room?.settings.timerMinutes} min</div>
            </Card>
            {room?.lastVote && (
              <Card className="p-3 text-sm bg-card/30 border-white/5">
                Last vote: {room.lastVote.message}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderFinished = () => (
    <Card className="p-6 text-center space-y-3 bg-card/50 border-white/10">
      <div className="text-xs text-muted-foreground uppercase tracking-widest">
        Mission Complete
      </div>
      <div className="text-3xl font-black font-mono">
        {room?.winner === "civilian" ? "Civilians win" : "Spies win"}
      </div>
      {room?.lastVote?.message && (
        <p className="text-sm text-muted-foreground">{room.lastVote.message}</p>
      )}
      <div className="text-sm text-muted-foreground">
        Next round in {finishCountdown}s — adjust settings or return home.
      </div>
      <div className="flex gap-2 justify-center">
        <Button
          variant="secondary"
          disabled={finishCountdown === 0}
          onClick={() => setFinishCountdown((c) => Math.max(0, c - 1))}
        >
          Skip timer
        </Button>
        <Button variant="outline" onClick={() => navigate("/online-menu")}>
          Main menu
        </Button>
      </div>
      <div className="grid gap-2">
        {room?.players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-3 py-2 rounded border border-white/5"
          >
            <span>{p.name}</span>
            <Badge variant={room?.settings.spyCount > 1 ? "secondary" : "outline"}>
              {p.role === "spy" ? "Spy" : "Civilian"}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );

  if (isLoading || !profile || !room) {
    return (
      <Layout className="items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting to operation...
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/online-menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              Lobby
            </div>
            <Card className="mt-1 px-3 py-2 flex items-center gap-2 border-dashed border-primary/40 bg-primary/5">
              <Share2 className="w-4 h-4 text-primary" />
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xl font-black">{code}</span>
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">Share this code to invite</span>
            </Card>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="w-4 h-4" />
          {profile.name}
        </Badge>
      </div>

      <Separator className="bg-white/10" />

      {room.phase === "lobby" && renderLobby()}
      {room.phase === "reveal" && renderReveal()}
      {room.phase === "playing" && renderInGame()}
      {room.phase === "voting" && renderInGame()}
      {room.phase === "finished" && renderFinished()}
    </Layout>
  );
}
