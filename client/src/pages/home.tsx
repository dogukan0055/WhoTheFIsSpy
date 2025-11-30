import React from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useGame } from "@/lib/game-context";
import {
  Wifi,
  MonitorSmartphone,
  HelpCircle,
  Settings,
  VenetianMask,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { playSound } from "@/lib/audio";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { dispatch } = useGame();
  const { t } = useTranslation();

  const handleModeSelect = (mode: "offline" | "online") => {
    dispatch({ type: "SET_MODE", payload: mode });
    playSound("click");
  };

  return (
    <Layout className="justify-center space-y-12">
      <div className="absolute top-4 right-4">
        <Link href="/settings">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => playSound("click")}
          >
            <Settings className="w-6 h-6 text-muted-foreground hover:text-foreground" />
          </Button>
        </Link>
      </div>

      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-block p-4 rounded-full bg-primary/10 border border-primary/20 mb-4 ring-4 ring-primary/5">
          <VenetianMask className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl font-black font-mono tracking-tighter text-foreground">
          {t("home.title")}
        </h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          {t("home.tagline")}
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-xs mx-auto">
        <Link href="/setup" onClick={() => handleModeSelect("offline")}>
          <Button
            size="lg"
            className="w-full h-16 text-lg font-bold font-mono tracking-wide relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <MonitorSmartphone className="mr-3 w-6 h-6" />
            {t("home.offline")}
          </Button>
        </Link>

        <Link href="/online-menu" onClick={() => handleModeSelect("online")}>
          <Button
            variant="secondary"
            size="lg"
            className="w-full h-16 text-lg font-bold font-mono tracking-wide opacity-80"
          >
            <Wifi className="mr-3 w-6 h-6" />
            {t("home.online")}
          </Button>
        </Link>
      </div>

      <div className="text-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => playSound("click")}
            >
              <HelpCircle className="mr-2 w-4 h-4" />
              {t("home.howToPlay")}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-mono font-bold text-primary">
                {t("home.briefing")}
              </DialogTitle>
              <DialogDescription>
                {t("home.briefing.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-bold text-foreground mb-1">
                  {t("home.objective")}
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>
                    <strong className="text-blue-400">{t("home.civil")}</strong>{" "}
                    {t("home.civilianObjective")}
                  </li>
                  <li>
                    <strong className="text-red-400">{t("home.spi")}</strong>{" "}
                    {t("home.spyObjective")}
                  </li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-1">
                  {t("home.gameplay")}
                </h3>
                <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                  {t("home.gameplay.steps")
                    .split("|")
                    .map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                </ol>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-1">
                  {t("home.win")}
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>
                    <strong>{t("home.spy")}</strong> {t("home.spyWins")}
                  </li>
                  <li>
                    <strong>{t("home.civ")}</strong> {t("home.civilianWins")}
                  </li>
                </ul>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground/30 font-mono">
        v1.1.0-PROTO // MOCKUP_MODE
      </footer>
    </Layout>
  );
}
