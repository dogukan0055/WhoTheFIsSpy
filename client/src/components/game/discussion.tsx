import React from "react";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Vote,
  MessageCircleQuestion,
  Home,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { useLocation } from "wouter";
import { playSound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import { getLocationName } from "@/lib/location-i18n";

export default function Discussion() {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [selectedGuess, setSelectedGuess] = React.useState<string | null>(null);
  const [expandedCats, setExpandedCats] = React.useState<
    Record<string, boolean>
  >({});
  const [showGuess, setShowGuess] = React.useState(false);
  const categoryAccents = React.useMemo(
    () => [
      {
        bg: "from-blue-500/10 via-blue-500/5",
        badge: "bg-blue-500/15 text-blue-100 border-blue-400/30",
      },
      {
        bg: "from-emerald-500/10 via-emerald-500/5",
        badge: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30",
      },
      {
        bg: "from-amber-500/10 via-amber-500/5",
        badge: "bg-amber-500/15 text-amber-100 border-amber-400/30",
      },
      {
        bg: "from-fuchsia-500/10 via-fuchsia-500/5",
        badge: "bg-fuchsia-500/15 text-fuchsia-100 border-fuchsia-400/30",
      },
    ],
    []
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExit = () => {
    playSound("click");
    dispatch({ type: "RESET_GAME" });
    navigate("/");
  };

  const submitGuess = () => {
    if (!selectedGuess) {
      toast({ title: t("discussion.invalidGuess") });
      return;
    }
    dispatch({ type: "SPY_GUESS", payload: selectedGuess });
    toast({ title: t("discussion.guessSubmitted") });
    setShowGuess(false);
    setSelectedGuess(null);
  };

  return (
    <div className="flex flex-col items-center h-full space-y-8 py-6">
      {/* Timer Header */}
      <div className="w-full space-y-4 text-center">
        {state.settings.isTimerOn && (
          <div className="relative py-8 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 text-6xl font-mono font-bold tracking-tighter tabular-nums relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <Clock
                className={cn(
                  "w-12 h-12 animate-pulse",
                  state.gameData.timeLeft < 60 ? "text-red-500" : "text-primary"
                )}
              />
              <span
                className={cn(state.gameData.timeLeft < 60 && "text-red-500")}
              >
                {formatTime(state.gameData.timeLeft)}
              </span>
            </div>
          </div>
        )}
        {!state.settings.isTimerOn && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-mono font-bold text-muted-foreground">
              NO TIMER
            </h2>
            <p className="text-sm text-muted-foreground">
              Take your time to discuss
            </p>
          </div>
        )}
      </div>

      {/* Instructions - Colorful Description */}
      <div className="flex-1 w-full space-y-6 text-center">
        <div className="bg-card/50 border border-border p-6 rounded-xl backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2 text-foreground">
            <MessageCircleQuestion className="w-6 h-6 text-blue-400" />
            {t("discussion.phaseTitle")}
          </h3>
          <div className="text-sm leading-relaxed space-y-2">
            <p>
              <span className="text-blue-400 font-bold">
                {t("discussion.civiliansLabel")}:
              </span>{" "}
              {t("discussion.civiliansHint")}
            </p>
            <p>
              <span className="text-red-400 font-bold">
                {t("discussion.spiesLabel")}:
              </span>{" "}
              {t("discussion.spiesHint")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card/30 p-4 rounded-lg border border-white/5">
            <span className="block text-2xl font-bold font-mono mb-1">
              {state.players.filter((p) => !p.isDead).length}
            </span>
            <span className="text-xs uppercase text-muted-foreground">
              {t("discussion.agentsActive")}
            </span>
          </div>
          <div className="bg-card/30 p-4 rounded-lg border border-white/5">
            <span className="block text-2xl font-bold font-mono mb-1">
              {state.gameData.spiesRemaining || state.settings.spyCount}
            </span>
            <span className="text-xs uppercase text-muted-foreground">
              {t("discussion.spiesRemaining")}
            </span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="w-full pt-8 space-y-3">
        {state.players.some((p) => p.role === "spy" && !p.isDead) && (
          <>
            <Button
              variant="outline"
              className="w-full h-12 text-sm justify-center gap-2"
              onClick={() => setShowGuess(!showGuess)}
            >
              <AlertTriangle className="w-4 h-4" />
              {t("discussion.spyGuess")}
            </Button>
            {showGuess && (
              <div className="space-y-3 bg-card/40 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground text-left">
                  {t("discussion.spyGuessHint")}
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {state.gameData.categories.map((cat, idx) => {
                    const expanded = expandedCats[cat.id] ?? false;
                    const accent = categoryAccents[idx % categoryAccents.length];
                    return (
                      <div
                        key={cat.id}
                        className={cn(
                          "rounded-md p-3 border transition-colors",
                          "bg-gradient-to-r to-transparent border-white/10",
                          accent.bg
                        )}
                      >
                        <button
                          className="w-full flex justify-between items-center text-sm font-semibold"
                          onClick={() =>
                            setExpandedCats((prev) => ({
                              ...prev,
                              [cat.id]: !expanded,
                            }))
                          }
                        >
                          <div className="flex flex-col items-start gap-1 text-left">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              {t("discussion.category")}
                            </span>
                            <span>{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full border text-[11px] font-semibold",
                                accent.badge
                              )}
                            >
                              {cat.locations.length}{" "}
                              {t("discussion.locationsLabel")}
                            </span>
                            {expanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                        {expanded && (
                          <div className="mt-2 grid grid-cols-1 gap-2">
                            {cat.locations.map((loc) => {
                              const label = getLocationName(
                                state.appSettings.language,
                                loc
                              );
                              const isSelected = selectedGuess === loc;
                              return (
                                <button
                                  key={loc}
                                  onClick={() => setSelectedGuess(loc)}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded border text-sm",
                                    isSelected
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-white/10 bg-background/60"
                                  )}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={submitGuess}
                  disabled={!selectedGuess}
                >
                  {t("discussion.spyGuessConfirm")}
                </Button>
              </div>
            )}
          </>
        )}
        <Button
          size="lg"
          variant="destructive"
          className="w-full h-16 text-lg font-bold font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
          onClick={() => dispatch({ type: "START_VOTING" })}
        >
          <Vote className="mr-2 w-6 h-6" />
          {t("discussion.voting")}
        </Button>
        <Button
          variant="ghost"
          className="w-full h-12 text-sm justify-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleExit}
        >
          <Home className="w-4 h-4" />
          {t("discussion.exit")}
        </Button>
      </div>
    </div>
  );
}
