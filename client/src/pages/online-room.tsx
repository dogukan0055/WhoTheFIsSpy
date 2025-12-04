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
import { useTranslation } from "@/hooks/use-translation";

type OnlineRoomProps = {
  params: { code: string };
};

export default function OnlineRoom({ params }: OnlineRoomProps) {
  const code = params.code.toUpperCase();
  const { profile, setProfile } = useOnlineProfile();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [room, setRoom] = useState<OnlineRoomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [chatInput, setChatInput] = useState("");
  const [questionTail, setQuestionTail] = useState("");
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
    INITIAL_CATEGORIES.map((c) => c.id)
  );
  const [locationPicks, setLocationPicks] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        INITIAL_CATEGORIES.map((c) => [c.id, [...c.locations]])
      )
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
        const settingsSig = JSON.stringify(next.settings);
        if (
          lastSettingsRef.current &&
          lastSettingsRef.current !== settingsSig
        ) {
          const mePlayer = next.players.find((p) => p.id === profile.playerId);
          if (!mePlayer?.isHost) {
            toast({
              title: t("online.settingsUpdated"),
              description: t("online.settingsUpdated"),
            });
          }
        }
        lastSettingsRef.current = settingsSig;
        setRoom(next);
        setIsLoading(false);
        if (!settingsDirtyRef.current) {
          // Derive which categories are active based on server locations, fall back to all
          const activeCats = INITIAL_CATEGORIES.filter((c) =>
            c.locations.some((loc) => next.settings.locations.includes(loc))
          ).map((c) => c.id);
          setSelectedCategories(
            activeCats.length ? activeCats : INITIAL_CATEGORIES.map((c) => c.id)
          );
          setSettingsDraft({
            spyCount: next.settings.spyCount,
            timerMinutes: next.settings.timerMinutes,
            locations: next.settings.locations.join(", "),
          });
          setLocationPicks(
            Object.fromEntries(
              INITIAL_CATEGORIES.map((c) => [
                c.id,
                c.locations.filter((loc) =>
                  next.settings.locations.includes(loc)
                ),
              ])
            )
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
          title: t("online.connectionLost"),
          description: err?.message ?? t("online.connectionLost"),
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
        title: t("online.reauthNeeded"),
        description:
          e?.message ?? t("online.reauthNeeded"),
        variant: "destructive",
      });
      return null;
    }
  };

  const handle = async (
    fn: (prof: OnlineProfile) => Promise<OnlineRoomState | void>
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
        title: t("online.actionFailed"),
        description: innerErr?.message ?? t("online.actionFailed"),
        variant: "destructive",
      });
          return;
        }
      }
      toast({
        title: t("online.actionFailed"),
        description: err?.message ?? t("online.actionFailed"),
        variant: "destructive",
      });
    }
  };

  const leaveRoom = React.useCallback(async () => {
    if (!profile) {
      navigate("/online-menu");
      return;
    }
    await handle((prof) => onlineApi.leave(prof, code));
    setProfile(null);
    navigate("/online-menu");
  }, [profile, handle, code, navigate, setProfile]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ title: t("online.copied"), description: t("online.copiedDesc") });
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
        title: t("online.roomClosed"),
        description: room.closedReason,
        variant: "destructive",
      });
      setTimeout(() => navigate("/online-menu"), 1200);
    }
  }, [room?.closedReason, navigate]);
  const lastSettingsRef = React.useRef<string>("");

  const readyCount = room?.players.filter((p) => p.isReady).length ?? 0;

  const renderPlayers = () => (
    <Card className="p-4 space-y-3 bg-card/40 border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("online.agents")}</h3>
        <Badge variant="secondary">
          {room?.players.length ?? 0}/8 {t("online.enlisted")}
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
                {p.isHost && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-primary/60 text-primary"
                  >
                    {t("online.host")}
                  </Badge>
                )}
                {p.isReady && room?.phase === "lobby" && <span>{t("online.ready")}</span>}
                {p.eliminated && <span>{t("online.eliminated")}</span>}
              </div>
            </div>
            {room?.phase === "lobby" && p.isReady && (
              <Badge className="bg-emerald-500/20 text-emerald-200">
                {t("online.ready")}
              </Badge>
            )}
            {room?.phase === "lobby" && !p.isReady && (
              <Badge variant="outline">{t("online.waiting")}</Badge>
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
            <div className="text-xs uppercase text-muted-foreground font-mono">
              {t("online.gameSettings")}
            </div>
            <h3 className="text-lg font-semibold">{t("online.curationTitle")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("online.curationDesc")}
            </p>
          </div>
          <Badge variant="secondary">{t("online.hostOnly")}</Badge>
        </div>
        <div className="space-y-3">
          <label className="text-xs text-muted-foreground font-mono">
            {t("online.spyCountLabel")}
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
            {t("online.roundTimerLabel")}
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
              {t("online.hostGameSettings")}
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
                        !me?.isHost && "opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {cat.name}
                        </span>
                        <Switch
                          checked={enabled}
                          disabled={!me?.isHost}
                          onCheckedChange={() => {
                            if (!me?.isHost) return;
                            setSettingsDirty(true);
                            setSelectedCategories((prev) =>
                              prev.includes(cat.id)
                                ? prev.filter((id) => id !== cat.id)
                                : [...prev, cat.id]
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
                                    : "border-white/10 bg-background/60 text-muted-foreground"
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
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("online.curationDesc")}
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
                          const cat = INITIAL_CATEGORIES.find(
                            (c) => c.id === catId
                          );
                          if (!cat) return [];
                          const picks =
                            locationPicks[catId]?.filter((l) =>
                              cat.locations.includes(l)
                            ) ?? [];
                          return picks.length > 0 ? picks : cat.locations;
                        })
                      : INITIAL_CATEGORIES.flatMap((c) => c.locations);
                  const filteredLocs = Array.from(new Set(selectedLocs));
                  if (filteredLocs.length === 0) {
                    toast({
                      title: t("online.noLocationsSelected"),
                      description: t("online.enableLocation"),
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
                  const updated = await onlineApi.updateSettings(
                    profile!,
                    code,
                    {
                      spyCount: settingsDraft.spyCount,
                      timerMinutes: settingsDraft.timerMinutes,
                      locations: chosenLocations.length
                        ? chosenLocations
                        : INITIAL_CATEGORIES.flatMap((c) => c.locations),
                    }
                  );
                  toast({
                    title: t("online.settingsSaved"),
                    description: t("online.settingsUpdated"),
                  });
                  setSettingsDirty(false);
                  return updated;
                })
              }
            >
              {t("online.saveSettings")}
            </Button>
          )}
        </div>
      </Card>
      <div className="space-y-3">
        {renderPlayers()}
        <Card className="p-4 flex flex-col gap-2 bg-card/40 border-white/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {t("online.readyUp")} ({readyCount}/{room?.players.length ?? 0})
              </div>
              <Badge variant="secondary">{t("online.minToStart")}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={me?.isReady ? "secondary" : "default"}
                onClick={() =>
                  handle((prof) =>
                    onlineApi.setReady(prof, code, !(me?.isReady ?? false))
                  )
                }
              >
                {me?.isReady ? t("online.notReady") : t("online.ready")}
              </Button>
              {me?.isHost && (
                <Button
                  disabled={!room || readyCount < 4}
                  onClick={() => handle((prof) => onlineApi.start(prof, code))}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {t("online.start")}
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
        {t("online.revealPhase")}
      </div>
      <div className="text-4xl font-black font-mono flex items-center justify-center gap-3">
        {room?.yourRole === "spy" ? (
          <>
            <Badge variant="destructive" className="text-base px-3 py-1">
              SPY
            </Badge>
            <span>{t("online.youAreSpy")}</span>
          </>
        ) : (
          <>
            <Badge variant="secondary" className="text-base px-3 py-1">
              CIVILIAN
            </Badge>
            <span>{t("online.youAreCivilian")}</span>
          </>
        )}
      </div>
      {room?.yourRole === "civilian" && (
        <div className="text-muted-foreground">
          <div className="text-xs uppercase tracking-widest">
            {t("online.locationLabel")}
          </div>
          <div className="text-2xl font-semibold">{room.location}</div>
        </div>
      )}
      <div className="text-6xl font-black font-mono text-primary drop-shadow">
        {revealCountdown ?? 0}s
      </div>
      <p className="text-sm text-muted-foreground">
        {t("online.revealHelper")}
      </p>
    </Card>
  );

  const currentTurn = room?.turn;
  const currentAsker = room?.players.find((p) => p.id === currentTurn?.askerId);
  const currentTarget = room?.players.find(
    (p) => p.id === currentTurn?.targetId
  );

  const renderTurnControls = () => {
    if (!room || !currentTurn) return null;

    if (
      currentTurn.status === "awaiting-question" &&
      me?.id === currentTurn.askerId
    ) {
      return (
        <Card className="p-4 space-y-3 bg-card/40 border-white/5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldQuestion className="w-4 h-4" />
            {t("online.yourTurnToAsk")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("online.askHelper")}
          </div>
          <div className="text-4xl font-black font-mono text-primary">
            {Math.ceil((currentTurn.remainingMs ?? 0) / 1000)}s
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase">
              {t("online.chooseTarget")}
            </div>
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
                        : "border-white/10 bg-background/60 text-foreground"
                    )}
                  >
                    <span>{p.name}</span>
                    <Badge variant="secondary">{t("online.target")}</Badge>
                  </button>
                ))}
            </div>
          </div>
          <div className="text-sm font-mono bg-background/60 border border-white/10 rounded px-3 py-2 flex items-center gap-2">
            <span className="whitespace-nowrap text-muted-foreground text-xs sm:text-sm">
              {t("online.questionPrefix")}
            </span>
            <Input
              value={questionTail}
              onChange={(e) => setQuestionTail(e.target.value)}
              placeholder={t("online.questionPlaceholder")}
              className="flex-1"
            />
            <span className="text-muted-foreground">?</span>
          </div>
          <Button
            disabled={!targetId || !questionTail.trim()}
            onClick={() =>
              handle((prof) =>
                onlineApi.askQuestion(
                  prof,
                  code,
                  targetId!,
                  `${t("online.questionPrefix")} ${questionTail.trim()}?`
                )
              )
            }
          >
            {t("online.sendQuestion")}
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
            {t("online.mustAnswer")}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentAsker?.name} {t("online.asked")}{" "}
            <span className="font-semibold">{currentTurn.question}</span>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() =>
                handle((prof) => onlineApi.answer(prof, code, "yes"))
              }
            >
              {t("online.answerYes")}
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() =>
                handle((prof) => onlineApi.answer(prof, code, "no"))
              }
            >
              {t("online.answerNo")}
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
            ? `${currentAsker?.name ?? t("online.someone")} ${t("online.isPicking")}`
            : `${currentTarget?.name ?? t("online.player")} ${t("online.isAnswering")}`}
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
          {t("online.chatTitle")}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setChatInput(t("online.quickChat"))}
        >
          <TimerReset className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-[240px] max-h-[320px] overflow-y-auto space-y-2 pr-1">
        {room?.chat.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "text-sm p-2 rounded border border-white/5",
              msg.system
                ? "text-muted-foreground bg-white/5"
                : "bg-background/40"
            )}
          >
            <div className="text-[11px] text-muted-foreground mb-1">
              {msg.system ? t("online.system") : msg.senderName ?? t("online.player")} ·{" "}
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
            <div className="font-mono break-words">{msg.message}</div>
          </div>
        ))}
      </div>
      {room?.phase === "voting" && (
        <div className="flex gap-2 mt-3">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={t("online.chatPlaceholder")}
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
        {t("online.voteInProgress")}
      </div>
      <div className="text-xs text-muted-foreground">
        {t("online.voteHint")} {voteCountdown ?? 0}s
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
                  : "border-white/10 bg-background/60 text-foreground"
              )}
              >
              <span>{p.name}</span>
              {voteTarget === p.id && (
                <Badge variant="secondary">{t("online.selected")}</Badge>
              )}
            </button>
          ))}
      </div>
      <Button
        disabled={!voteTarget}
        onClick={() =>
          handle((prof) => onlineApi.vote(prof, code, voteTarget!))
        }
      >
        {t("online.confirmVote")}
      </Button>
      {room?.lastVote?.message && (
        <div className="text-xs text-muted-foreground">
          {room.lastVote.message}
        </div>
      )}
    </Card>
  );

  const renderInGame = () =>
    room?.phase === "voting" ? (
      <div className="space-y-4">
        <Card className="p-6 text-center bg-card/50 border-white/10">
          <div className="text-xs uppercase text-muted-foreground tracking-widest">
            {t("online.votingTimer")}
          </div>
          <div className="text-5xl font-black font-mono">
            {voteCountdown ?? 0}s
          </div>
          <p className="text-sm text-muted-foreground">
            {t("online.votingHelper")}
          </p>
        </Card>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-3 md:col-span-2">
            {renderVoting()}
            {renderChat()}
          </div>
          <div className="space-y-3">{renderPlayers()}</div>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <Card className="p-4 space-y-2 bg-card/40 border-white/5">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {t("online.brief")}
            </div>
            <div className="text-xl font-black font-mono">
              {room?.yourRole === "spy" ? (
                <Badge variant="destructive" className="text-lg py-1 px-2">
                  SPY
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-lg py-1 px-2">
                  CIVILIAN
                </Badge>
              )}
            </div>
            {room?.yourRole === "civilian" && (
              <p className="text-sm text-muted-foreground">
                {t("online.locationLabel")}: {room?.location}
              </p>
            )}
            {me?.lockedOutOfAsking && (
              <Badge variant="destructive">{t("online.cannotAsk")}</Badge>
            )}
          </Card>
          <Card className="p-4 space-y-2 bg-card/40 border-white/5 flex flex-col justify-between">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {t("online.missionTimer")}
            </div>
            <div className="text-3xl font-black font-mono">
              {timeLeft ?? "--:--"}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("online.timerHelper")}
            </div>
          </Card>
          <Card className="p-4 space-y-2 bg-card/40 border-white/5 flex flex-col justify-between">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {t("online.actions")}
            </div>
            <Button
              variant="destructive"
              disabled={room?.phase !== "playing" || me?.calledVote}
              onClick={() => handle((prof) => onlineApi.callVote(prof, code))}
            >
              <Vote className="w-4 h-4 mr-2" />
              {t("discussion.voting")}
            </Button>
            <Button
              variant="outline"
              onClick={() => leaveRoom()}
            >
              {t("online.leaveRoom")}
            </Button>
          </Card>
        </div>

        {currentTurn && renderTurnControls()}

        <div className="grid md:grid-cols-3 gap-3 items-start">
          <div className="md:col-span-2">{renderChat()}</div>
          <div className="space-y-3">
            {renderPlayers()}
            <Card className="p-4 bg-card/40 border-white/5">
              <div className="text-xs uppercase text-muted-foreground">
                {t("online.gameSettings")}
              </div>
              <div className="text-sm">
                {t("online.spiesLabel")}: {room?.settings.spyCount}
              </div>
              <div className="text-sm">
                {t("online.timerLabel")}: {room?.settings.timerMinutes} min
              </div>
            </Card>
            {room?.lastVote && (
              <Card className="p-3 text-sm bg-card/30 border-white/5">
                Last vote: {room.lastVote.message}
              </Card>
            )}
          </div>
        </div>
      </div>
    );

  const renderFinished = () => (
    <Card className="p-6 text-center space-y-3 bg-card/50 border-white/10">
      <div className="text-xs text-muted-foreground uppercase tracking-widest">
        {t("online.missionComplete")}
      </div>
      <div className="text-3xl font-black font-mono">
        {room?.winner === "civilian" ? t("online.civiliansWin") : t("online.spiesWin")}
      </div>
      {room?.lastVote?.message && (
        <p className="text-sm text-muted-foreground">{room.lastVote.message}</p>
      )}
      <div className="grid gap-2 text-left">
        {room?.players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-3 py-2 rounded border border-white/5"
          >
            <span>{p.name}</span>
            <Badge variant={p.role === "spy" ? "destructive" : "secondary"}>
              {p.role === "spy" ? "Spy" : "Civilian"}
            </Badge>
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-2">
        <div className="text-sm text-muted-foreground">
          {t("online.votePrompt")}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1"
            onClick={() => handle((prof) => onlineApi.start(prof, code))}
          >
            {t("online.rematchSame")}
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            onClick={() =>
              handle((prof) =>
                onlineApi.chat(prof, code, t("online.voteNewSettings"))
              )
            }
          >
            {t("online.rematchNew")}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() =>
              handle(async (prof) => {
                await onlineApi.leave(prof, code);
                navigate("/online-menu");
                return undefined;
              })
            }
          >
            {t("online.quitToMenu")}
          </Button>
        </div>
      </div>
    </Card>
  );

  if (isLoading || !profile || !room) {
    return (
      <Layout className="items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          {t("online.connecting")}
        </div>
      </Layout>
    );
  }

  let phaseView: React.ReactNode;
  if (room.phase === "lobby") {
    phaseView = renderLobby();
  } else if (room.phase === "reveal") {
    phaseView = renderReveal();
  } else if (room.phase === "finished") {
    phaseView = renderFinished();
  } else {
    // Default to in-game layout for playing, voting, or any unexpected phase to avoid blank screens
    phaseView = renderInGame();
  }

  return (
    <Layout className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => leaveRoom()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {t("online.lobbyTitle")}
            </div>
            <Card className="mt-1 px-3 py-2 flex items-center gap-2 border-dashed border-primary/40 bg-primary/5">
              <Share2 className="w-4 h-4 text-primary" />
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xl font-black">{code}</span>
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">
                  {t("online.shareCode")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: "Join my lobby",
                          text: `Room code: ${code}`,
                        });
                      } catch {
                        /* ignore */
                      }
                    } else {
                      copyCode();
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="w-4 h-4" />
          {profile.name}
        </Badge>
      </div>

      <Separator className="bg-white/10" />

      {phaseView}
    </Layout>
  );
}
