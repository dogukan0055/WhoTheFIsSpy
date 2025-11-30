import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useGame, Player } from "@/lib/game-context";
import { containsProfanity } from "@/lib/locations";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NumberPicker } from "@/components/ui/number-picker";
import {
  ArrowLeft,
  Users,
  Timer,
  Play,
  Map,
  Edit2,
  VenetianMask,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { playSound } from "@/lib/audio";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";

const MAX_NAME_LENGTH = 16;
const NAME_PATTERN = /^[\p{L}\p{M}\s'’.-]*$/u;

export default function OfflineSetup() {
  const { state, dispatch } = useGame();
  const [_, setLocation] = useLocation();
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    if (state.players.length > 0) {
      return state.players.map((p) => p.name);
    }

    const saved = localStorage.getItem("spy-player-names");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed
            .filter(
              (name): name is string =>
                typeof name === "string" && name.trim().length > 0
            )
            .map(
              (name, idx) =>
                name.slice(0, MAX_NAME_LENGTH) || `Player ${idx + 1}`
            )
            .slice(0, state.settings.playerCount);
          while (sanitized.length < state.settings.playerCount) {
            sanitized.push(`Player ${sanitized.length + 1}`);
          }
          return sanitized;
        }
      } catch {
        /* ignore parse errors */
      }
    }

    return Array(state.settings.playerCount)
      .fill("")
      .map((_, i) => `Player ${i + 1}`);
  });
  const [isRenaming, setIsRenaming] = useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    localStorage.setItem("spy-player-names", JSON.stringify(playerNames));
  }, [playerNames]);

  // Sync internal state if needed
  React.useEffect(() => {
    if (playerNames.length !== state.settings.playerCount) {
      setPlayerNames((prev) => {
        const newCount = state.settings.playerCount;
        if (newCount > prev.length) {
          return [
            ...prev,
            ...Array(newCount - prev.length)
              .fill("")
              .map((_, i) => `Player ${prev.length + i + 1}`),
          ];
        } else {
          return prev.slice(0, newCount);
        }
      });
    }
  }, [state.settings.playerCount]);

  const handlePlayerCountChange = (val: number) => {
    playSound("click");
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: {
        playerCount: val,
        spyCount: val <= 5 ? 1 : state.settings.spyCount, // Auto-adjust spy logic
      },
    });
  };

  const handleSpyCountChange = (val: number) => {
    playSound("click");
    dispatch({ type: "UPDATE_SETTINGS", payload: { spyCount: val } });
  };

  const handleTimerChange = (val: number) => {
    playSound("click");
    dispatch({ type: "UPDATE_SETTINGS", payload: { timerDuration: val } });
  };

  const handleNameChange = (index: number, value: string) => {
    if (value.length > MAX_NAME_LENGTH) return;
    if (!NAME_PATTERN.test(value)) return;

    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleSaveRoster = () => {
    for (const name of playerNames) {
      if (!name.trim()) {
        toast({
          title: t("setup.invalidName"),
          description: t("setup.invalidNameDesc"),
          variant: "destructive",
        });
        playSound("error");
        return;
      }
      if (containsProfanity(name)) {
        toast({
          title: t("setup.nameRejected"),
          description: t("setup.profanityDesc"),
          variant: "destructive",
        });
        playSound("error");
        return;
      }
    }

    dispatch({ type: "UPDATE_PLAYERS", payload: playerNames });
    playSound("success");
    setIsRenaming(false);
  };

  const handleStartGame = () => {
    playSound("click");
    // Validation
    for (const name of playerNames) {
      if (!name.trim()) {
        toast({
          title: t("setup.invalidName"),
          description: t("setup.invalidNameDesc"),
          variant: "destructive",
        });
        playSound("error");
        return;
      }
      if (containsProfanity(name)) {
        toast({
          title: t("setup.nameRejected"),
          description: `Name "${name}" is not allowed.`,
          variant: "destructive",
        });
        playSound("error");
        return;
      }
    }

    // Check Categories
    if (state.settings.selectedCategories.length === 0) {
      toast({
        title: t("setup.noLocations"),
        description: t("setup.noLocationsDesc"),
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    const sanitizedNames = playerNames.map((name) => name.trim());

    const players: Player[] = sanitizedNames.map((name, idx) => ({
      id: `p-${idx}`,
      name,
      role: "civilian",
      isDead: false,
      votes: 0,
    }));

    let spiesAssigned = 0;
    while (spiesAssigned < state.settings.spyCount) {
      const randIdx = Math.floor(Math.random() * players.length);
      if (players[randIdx].role !== "spy") {
        players[randIdx].role = "spy";
        spiesAssigned++;
      }
    }

    // Get random category from selected ones with enabled locations
    const validCategories = state.gameData.categories
      .filter((c) => state.settings.selectedCategories.includes(c.id))
      .map((c) => ({
        ...c,
        enabledLocations: c.locations.filter(
          (loc) => !(state.settings.disabledLocations[c.id] || []).includes(loc)
        ),
      }))
      .filter((c) => c.enabledLocations.length > 0);

    const randomCat =
      validCategories[Math.floor(Math.random() * validCategories.length)];

    if (!randomCat) {
      toast({
        title: t("setup.locationDisabled"),
        description: t("setup.locationDisabledDesc"),
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    const randomLoc =
      randomCat.enabledLocations[
        Math.floor(Math.random() * randomCat.enabledLocations.length)
      ];

    localStorage.setItem("spy-player-names", JSON.stringify(sanitizedNames));

    dispatch({ type: "SET_PLAYERS", payload: players });
    dispatch({
      type: "START_GAME",
      payload: {
        location: randomLoc,
        players,
      },
    });

    setLocation("/game");
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => playSound("click")}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-mono ml-2 flex items-center gap-2">
            <VenetianMask className="w-6 h-6 text-primary" />
            {t("setup.title")}
          </h1>
        </div>
      </div>

      <div className="space-y-8 pb-24 max-w-4xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Players Count */}
          <section className="space-y-3 bg-card/30 p-4 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 w-4 h-4" /> {t("setup.agents")}
              </Label>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {t("setup.minMaxAgents")}
              </span>
            </div>
            <NumberPicker
              min={4}
              max={8}
              value={state.settings.playerCount}
              onChange={handlePlayerCountChange}
            />
            <p className="text-xs text-muted-foreground text-balance">
              {t("setup.agentsHelper")}
            </p>
          </section>

          {/* Spy Count */}
          <section className="space-y-3 bg-card/30 p-4 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center text-sm text-muted-foreground">
                <VenetianMask className="mr-2 w-4 h-4" /> {t("setup.spies")}
              </Label>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {state.settings.playerCount > 5
                  ? t("setup.minMaxSpies")
                  : t("setup.locked")}
              </span>
            </div>
            {state.settings.playerCount > 5 ? (
              <NumberPicker
                min={1}
                max={2}
                value={state.settings.spyCount}
                onChange={handleSpyCountChange}
                className="border-red-500/20 bg-red-500/5"
              />
            ) : (
              <div className="h-14 flex items-center justify-center border border-white/5 rounded-lg bg-white/5 text-muted-foreground font-mono text-sm">
                {t("setup.oneSpyMax")}
              </div>
            )}
            <p className="text-xs text-muted-foreground text-balance">
              {t("setup.spiesHelper")}
            </p>
          </section>
        </div>

        {/* Timer */}
        <section className="space-y-4 bg-card/30 p-4 rounded-lg border border-white/5">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1 text-balance">
              <Label className="flex items-center">
                <Timer className="mr-2 w-5 h-5 text-blue-500" />{" "}
                {t("setup.timer")}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {t("setup.timerHelper")}
              </p>
            </div>
            <Switch
              checked={state.settings.isTimerOn}
              onCheckedChange={(checked) => {
                playSound("click");
                dispatch({
                  type: "UPDATE_SETTINGS",
                  payload: { isTimerOn: checked },
                });
              }}
            />
          </div>

          {state.settings.isTimerOn && (
            <div className="mt-2 space-y-2">
              <NumberPicker
                min={5}
                max={30}
                step={1}
                value={state.settings.timerDuration}
                onChange={handleTimerChange}
                label={t("setup.minutes")}
              />
              <div className="text-[10px] text-muted-foreground text-center">
                {t("setup.minMaxTimer")}
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2 items-start">
          {/* Locations Button */}
          <div className="space-y-3 bg-card/30 p-4 rounded-lg border border-white/5 h-full">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Map className="w-4 h-4" />
                {t("setup.locations")}
              </div>
              <span className="text-[10px] uppercase text-muted-foreground text-right">
                {t("setup.locationsHelper")}
              </span>
            </div>
            <Link href="/locations">
              <Button
                variant="outline"
                className="w-full h-12 border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary"
                onClick={() => playSound("click")}
              >
                <Map className="w-4 h-4 mr-2" />
                {t("setup.manageLocations") ?? t("setup.locations")}
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-balance">
              {t("setup.locationsDeepHelper") ?? t("setup.locationsHelper")}
            </p>
          </div>

          {/* Player Management Button */}
          <div className="space-y-3 bg-card/30 p-4 rounded-lg border border-white/5 h-full">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Edit2 className="w-4 h-4" />
                {t("setup.manageRoster")}
              </div>
              <span className="text-[10px] uppercase text-muted-foreground text-right">
                {t("setup.rosterHelper")}
              </span>
            </div>
            <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full h-12"
                  onClick={() => playSound("click")}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t("setup.manageRoster")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("setup.manageRoster")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {playerNames.map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-muted-foreground font-mono text-xs border border-white/10">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={name}
                          onChange={(e) =>
                            handleNameChange(idx, e.target.value)
                          }
                          placeholder={`${t("setup.agents")} ${idx + 1}`}
                          className="font-mono tracking-wide bg-card/50 border-white/10 focus:border-primary/50 h-12"
                        />
                        <div className="text-[10px] text-muted-foreground text-right mt-1 tabular-nums">
                          {name.length}/{MAX_NAME_LENGTH}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2 gap-2">
                  <Button variant="ghost" onClick={() => setIsRenaming(false)}>
                    {t("setup.cancelRoster") ?? "Cancel"}
                  </Button>
                  <Button onClick={handleSaveRoster}>
                    {t("setup.saveRoster")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground text-balance">
              {t("setup.manageRosterHelper")}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/5 z-50">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button
            size="lg"
            className="flex-1 h-14 font-bold text-lg font-mono"
            onClick={handleStartGame}
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            {t("setup.start")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
