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
  Sword,
  TimerReset,
  Vote,
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
  const [question, setQuestion] = useState("Is this place ...?");
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
        }
      } catch (err: any) {
        if (!active) return;
        setIsLoading(false);
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

  const handle = async (fn: () => Promise<OnlineRoomState | void>) => {
    if (!profile) return;
    try {
      const next = await fn();
      if (next) {
        setRoom(next);
      }
    } catch (err: any) {
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
                {p.isHost && <span>Host</span>}
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
          <h3 className="text-sm font-semibold">Room Controls</h3>
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
              Location Database
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  disabled={!me?.isHost}
                  onClick={() => {
                    setSettingsDirty(true);
                    setSelectedCategories((prev) =>
                      prev.includes(cat.id)
                        ? prev.filter((id) => id !== cat.id)
                        : [...prev, cat.id],
                    );
                  }}
                  className={cn(
                    "flex items-center justify-between rounded border px-3 py-2 text-sm",
                    selectedCategories.includes(cat.id)
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-white/10 bg-background/40 text-muted-foreground",
                    !me?.isHost && "opacity-60 cursor-not-allowed",
                  )}
                >
                  <span>{cat.name}</span>
                  <Switch checked={selectedCategories.includes(cat.id)} disabled />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Matches the offline database style. Host toggles which location packs are in play.
            </p>
          </div>
          {me?.isHost && (
            <Button
              className="w-full"
              onClick={() =>
                handle(async () => {
                  const chosenLocations =
                    selectedCategories.length > 0
                      ? INITIAL_CATEGORIES.filter((c) =>
                          selectedCategories.includes(c.id),
                        ).flatMap((c) => c.locations)
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
                handle(() =>
                  onlineApi.setReady(profile!, code, !(me?.isReady ?? false)),
                )
              }
            >
              {me?.isReady ? "Unready" : "I'm ready"}
            </Button>
            {me?.isHost && (
              <Button
                disabled={!room || readyCount < 4}
                onClick={() => handle(() => onlineApi.start(profile!, code))}
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
    <Card className="p-6 bg-card/50 border border-primary/30 text-center space-y-3">
      <div className="text-xs text-muted-foreground uppercase tracking-widest">
        Reveal Phase
      </div>
      <div className="text-3xl font-black font-mono">
        {room?.yourRole === "spy" ? "YOU ARE A SPY" : "You are a civilian"}
      </div>
      {room?.yourRole === "civilian" && (
        <p className="text-muted-foreground">
          Location: <span className="font-semibold">{room.location}</span>
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Cards close in {revealCountdown}s
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
      const availableTargets =
        room.players.filter((p) => !p.eliminated && p.id !== me?.id) ?? [];
      return (
        <Card className="p-4 space-y-3 bg-card/40 border-white/5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldQuestion className="w-4 h-4" />
            Your turn to ask
          </div>
          <div className="text-xs text-muted-foreground">
            Choose a target and ask a yes/no question. {Math.ceil((currentTurn.remainingMs ?? 0) / 1000)}s left.
          </div>
          <select
            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm"
            value={targetId ?? ""}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">Select target</option>
            {availableTargets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Is this place...?"
          />
          <Button
            disabled={!targetId}
            onClick={() =>
              handle(() =>
                onlineApi.askQuestion(
                  profile!,
                  code,
                  targetId!,
                  question || "Is this place ...?",
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
              onClick={() => handle(() => onlineApi.answer(profile!, code, "yes"))}
            >
              Yes
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => handle(() => onlineApi.answer(profile!, code, "no"))}
            >
              No
            </Button>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {Math.ceil((currentTurn.remainingMs ?? 0) / 1000)}s remaining
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
        <div className="text-xs text-muted-foreground">
          {Math.ceil((currentTurn.remainingMs ?? 0) / 1000)}s left
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
      {room?.phase !== "lobby" && (
        <div className="flex gap-2 mt-3">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Send intel to everyone"
          />
          <Button
            onClick={() => {
              if (!chatInput.trim()) return;
              handle(() => onlineApi.chat(profile!, code, chatInput.trim()));
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
      <select
        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm"
        value={voteTarget ?? ""}
        onChange={(e) => setVoteTarget(e.target.value)}
      >
        <option value="">Choose suspect</option>
        {room?.players
          .filter((p) => !p.eliminated)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>
      <Button
        disabled={!voteTarget}
        onClick={() =>
          handle(() => onlineApi.vote(profile!, code, voteTarget!))
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
            onClick={() => handle(() => onlineApi.callVote(profile!, code))}
          >
            <Vote className="w-4 h-4 mr-2" />
            Call vote
          </Button>
          <Button
            variant="outline"
            onClick={() => {
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
              Room
            </div>
            <div className="text-2xl font-black font-mono flex items-center gap-2">
              {code}
              <Button variant="ghost" size="icon" onClick={copyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sword className="w-4 h-4" />
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
