import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Fingerprint, User, Home } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { playSound, vibrate } from "@/lib/audio";
import { useTranslation } from "@/hooks/use-translation";
import { getLocationName } from "@/lib/location-i18n";
import { useLocation } from "wouter";

export default function RoleReveal() {
  const { state, dispatch } = useGame();
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [holdProgress, setHoldProgress] = React.useState(0);
  const holdStartRef = React.useRef<number | null>(null);
  const holdRafRef = React.useRef<number | null>(null);
  const { t, language } = useTranslation();
  const [isHolding, setIsHolding] = React.useState(false);
  const [, navigate] = useLocation();

  const currentPlayer = state.players[state.gameData.currentRevealIndex];
  const isLastPlayer =
    state.gameData.currentRevealIndex === state.players.length - 1;

  const status: "idle" | "scanning" | "success" = isRevealed
    ? "success"
    : showScan
      ? "scanning"
      : "idle";

  const handleNext = () => {
    playSound("click");
    if (isLastPlayer) {
      dispatch({ type: "START_PLAYING" });
    } else {
      setIsRevealed(false);
      dispatch({ type: "NEXT_REVEAL" });
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    vibrate(80);
  };

  const handleExit = () => {
    playSound("click");
    dispatch({ type: "RESET_GAME" });
    navigate("/");
  };

  const stopHold = (skipReset = false) => {
    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    holdRafRef.current = null;
    holdStartRef.current = null;
    setIsHolding(false);
    if (!skipReset && !isRevealed) {
      setHoldProgress(0);
    }
  };

  const beginHold = () => {
    if (isRevealed || holdStartRef.current !== null) return;
    setIsHolding(true);
    holdStartRef.current = performance.now();

    const step = (now: number) => {
      if (holdStartRef.current === null) return;
      const elapsed = now - holdStartRef.current;
      const progress = Math.min((elapsed / 1500) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        handleReveal();
        stopHold(true);
      } else {
        holdRafRef.current = requestAnimationFrame(step);
      }
    };

    holdRafRef.current = requestAnimationFrame(step);
  };

  React.useEffect(() => {
    setIsRevealed(false);
    setHoldProgress(0);
    stopHold(true);
  }, [state.gameData.currentRevealIndex]);

  const showScan = (isHolding || holdProgress > 0) && !isRevealed;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-mono">
          Agent {state.gameData.currentRevealIndex + 1} / {state.players.length}
        </h2>
        <h1 className="text-4xl font-bold font-mono tracking-tighter">
          {currentPlayer.name}
        </h1>
      </div>

      <Card className="w-full aspect-[3/4] max-w-xs relative overflow-hidden border-2 border-border bg-card/50 backdrop-blur-sm shadow-xl select-none">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-6">
          {!isRevealed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 w-full"
            >
              <p className="text-lg font-medium leading-tight">
                {t("reveal.pass")}
                <br />
                <span className="text-primary font-bold text-2xl">
                  {currentPlayer.name}
                </span>
              </p>
              <div
                className="relative w-40 h-40 mx-auto rounded-full bg-background border-4 overflow-hidden flex items-center justify-center select-none transition-all duration-300"
                onPointerDown={beginHold}
                onPointerUp={() => stopHold()}
                onPointerLeave={() => stopHold()}
                onTouchStart={beginHold}
                onTouchEnd={() => stopHold()}
              >
                {/* static grid */}
                <div className="absolute inset-2 rounded-full opacity-30 bg-[radial-gradient(circle,rgba(59,130,246,0.35),transparent_60%)] pointer-events-none" />

                {/* scan fill with clip */}
                <div
                  className="absolute inset-4"
                  style={{ clipPath: `inset(${100 - holdProgress}% 0 0 0)` }}
                >
                  <Fingerprint
                    size={120}
                    strokeWidth={1}
                    className={`mx-auto ${
                      status === "success"
                        ? "text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                        : "text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                    }`}
                  />
                  {status === "scanning" && (
                    <div
                      className="absolute left-0 right-0 h-[3px] bg-cyan-200/80 blur-sm scan-line"
                      style={{ top: `${100 - holdProgress}%` }}
                    />
                  )}
                </div>

                {/* base fingerprint outline */}
                <Fingerprint
                  size={120}
                  strokeWidth={1}
                  className="absolute inset-4 text-muted-foreground/40"
                />

                {/* pulsing ring */}
                {status === "scanning" && (
                  <motion.div
                    className="absolute inset-2 rounded-full border border-primary/40 pointer-events-none"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
                {/* progress ring */}
                <div
                  className="absolute inset-1.5 rounded-full border border-primary/30 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 90deg, ${
                      status === "success" ? "rgba(16,185,129,0.6)" : "rgba(59,130,246,0.6)"
                    } ${holdProgress}%, transparent ${holdProgress}% 100%)`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center leading-tight px-4">
                {t("reveal.hold")}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 w-full"
            >
              {currentPlayer.role === "spy" ? (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 animate-pulse">
                    <Fingerprint className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-red-500 font-mono uppercase">
                    {t("reveal.spy")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("reveal.spyDesc")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
                    <User className="w-12 h-12 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-400 font-mono uppercase">
                    {t("reveal.civilian")}
                  </h2>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 uppercase mb-1">
                      {t("reveal.location")}
                    </p>
                    <p className="text-2xl font-bold text-blue-100">
                      {getLocationName(language, state.gameData.currentLocation)}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>

      <Button
        size="lg"
        className="w-full max-w-xs font-mono h-14"
        variant={isRevealed ? "default" : "secondary"}
        disabled={!isRevealed}
        onClick={() => handleNext()}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isRevealed ? "continue" : "hold"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 text-center whitespace-normal leading-tight text-sm sm:text-base"
          >
            {isRevealed
              ? isLastPlayer
                ? t("reveal.startMission")
                : t("reveal.nextAgent")
              : t("reveal.tap")}
          </motion.span>
        </AnimatePresence>
      </Button>

      <Button
        variant="ghost"
        className="w-full max-w-xs h-12 text-sm justify-center gap-2 text-muted-foreground hover:text-foreground"
        onClick={handleExit}
      >
        <Home className="w-4 h-4" />
        {t("discussion.exit")}
      </Button>
    </div>
  );
}
