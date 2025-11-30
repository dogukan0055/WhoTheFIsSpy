import React from "react";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Layout from "@/components/layout";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Smartphone,
  Music,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "wouter";
import { playSound } from "@/lib/audio";
import { useTranslation } from "@/hooks/use-translation";

const FlagIcon = ({ country }: { country: "us" | "tr" }) => {
  if (country === "tr") {
    return (
      <svg
        viewBox="0 0 640 480"
        className="w-5 h-5 rounded-sm shadow shrink-0"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="#e30a17" d="M0 0h640v480H0z" />
        <path
          fill="#fff"
          d="M304 240a96 96 0 1 1-191.9 0 96 96 0 1 1 191.9 0z"
        />
        <path
          fill="#e30a17"
          d="M320 240a80 80 0 1 1-160 0 80 80 0 1 1 160 0z"
        />
        <path fill="#fff" d="m320 240 112-36-69 96V180l69 96z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 7410 3900"
      className="w-5 h-5 rounded-sm shadow shrink-0"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path fill="#b22234" d="M0 0h7410v3900H0z" />
      <path
        stroke="#fff"
        strokeWidth="300"
        d="M0 450h7410M0 1050h7410M0 1650h7410M0 2250h7410M0 2850h7410M0 3450h7410"
      />
      <path fill="#3c3b6e" d="M0 0h2964v2100H0z" />
      <g fill="#fff">
        <g id="s">
          <g id="t">
            <path d="m247 90 70.534 217.082L32 176.918h430L176.466 307.082 247 90z" />
            <use xlinkHref="#t" x="247" />
            <use xlinkHref="#t" x="494" />
            <use xlinkHref="#t" x="741" />
            <use xlinkHref="#t" x="988" />
          </g>
          <use xlinkHref="#t" y="210" />
        </g>
        <use xlinkHref="#s" y="420" />
        <use xlinkHref="#s" y="840" />
        <use xlinkHref="#s" y="1260" />
        <use xlinkHref="#s" y="1680" />
      </g>
    </svg>
  );
};

export default function Settings() {
  const { state, dispatch } = useGame();
  const { sound, vibrate, music, highContrast } = state.appSettings;
  const { t, language } = useTranslation();

  const toggleSetting = (key: keyof typeof state.appSettings) => {
    dispatch({
      type: "UPDATE_APP_SETTINGS",
      payload: { [key]: !state.appSettings[key] },
    });
    playSound("click");
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => playSound("click")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-mono ml-2">
          {t("settings.title")}
        </h1>
      </div>

      <div className="space-y-6">
        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
              {t("settings.audio")}
            </h2>
          </div>

          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    sound
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {sound ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <Label className="text-base">{t("settings.sound")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.soundDesc")}
                  </p>
                </div>
              </div>
              <Switch
                checked={sound}
                onCheckedChange={() => toggleSetting("sound")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    music
                      ? "bg-secondary/20 text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-base">{t("settings.music")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.musicDesc")}
                  </p>
                </div>
              </div>
              <Switch
                checked={music}
                onCheckedChange={() => toggleSetting("music")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    vibrate
                      ? "bg-green-500/20 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-base">{t("settings.vibrate")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.vibrateDesc")}
                  </p>
                </div>
              </div>
              <Switch
                checked={vibrate}
                onCheckedChange={() => toggleSetting("vibrate")}
              />
            </div>
          </div>
        </div>

        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
              {t("settings.accessibility")}
            </h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    highContrast
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {highContrast ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <Label className="text-base">
                    {t("settings.highContrast")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.highContrastDesc")}
                  </p>
                </div>
              </div>
              <Switch
                checked={highContrast}
                onCheckedChange={() => toggleSetting("highContrast")}
              />
            </div>
          </div>
        </div>

        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
              {t("settings.language")}
            </h2>
          </div>
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <Label className="text-base">{t("settings.language")}</Label>
              <p className="text-xs text-muted-foreground text-balance">
                {t("settings.languageDesc")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={language === "en" ? "default" : "outline"}
                onClick={() =>
                  dispatch({
                    type: "UPDATE_APP_SETTINGS",
                    payload: { language: "en" },
                  })
                }
                className="flex items-center gap-2"
              >
                <FlagIcon country="us" /> EN
              </Button>
              <Button
                variant={language === "tr" ? "default" : "outline"}
                onClick={() =>
                  dispatch({
                    type: "UPDATE_APP_SETTINGS",
                    payload: { language: "tr" },
                  })
                }
                className="flex items-center gap-2"
              >
                <FlagIcon country="tr" /> TR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
