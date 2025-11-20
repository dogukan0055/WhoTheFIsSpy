import React from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Music, Eye, EyeOff } from 'lucide-react';
import { Link } from 'wouter';
import { playSound } from '@/lib/audio';
import { useTranslation } from '@/hooks/use-translation';

export default function Settings() {
  const { state, dispatch } = useGame();
  const { sound, vibrate, music, highContrast } = state.appSettings;
  const { t, language } = useTranslation();

  const toggleSetting = (key: keyof typeof state.appSettings) => {
    dispatch({ 
      type: 'UPDATE_APP_SETTINGS', 
      payload: { [key]: !state.appSettings[key] } 
    });
    playSound('click');
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" onClick={() => playSound('click')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-mono ml-2">{t('settings.title')}</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">{t('settings.audio')}</h2>
          </div>
          
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sound ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <Label className="text-base">{t('settings.sound')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.soundDesc')}</p>
                </div>
              </div>
              <Switch checked={sound} onCheckedChange={() => toggleSetting('sound')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${music ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                   <Music className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-base">{t('settings.music')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.musicDesc')}</p>
                </div>
              </div>
              <Switch checked={music} onCheckedChange={() => toggleSetting('music')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${vibrate ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                   <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-base">{t('settings.vibrate')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.vibrateDesc')}</p>
                </div>
              </div>
              <Switch checked={vibrate} onCheckedChange={() => toggleSetting('vibrate')} />
            </div>
          </div>
        </div>

        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">{t('settings.accessibility')}</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${highContrast ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                   {highContrast ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <Label className="text-base">{t('settings.highContrast')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.highContrastDesc')}</p>
                </div>
              </div>
              <Switch checked={highContrast} onCheckedChange={() => toggleSetting('highContrast')} />
            </div>
          </div>
        </div>

        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">{t('settings.language')}</h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <Label className="text-base">{t('settings.language')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'UPDATE_APP_SETTINGS', payload: { language: 'en' } })}
                className="flex items-center gap-2"
              >
                🇺🇸 EN
              </Button>
              <Button
                variant={language === 'tr' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'UPDATE_APP_SETTINGS', payload: { language: 'tr' } })}
                className="flex items-center gap-2"
              >
                🇹🇷 TR
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 text-center space-y-2">
          <h3 className="text-xs font-mono text-muted-foreground">{t('settings.credits')}</h3>
          <div className="p-4 bg-card/10 rounded-lg text-sm text-muted-foreground border border-white/5">
            <p className="mb-2">Designed & Developed by</p>
            <p className="font-bold text-foreground mb-4">REPLIT AGENT</p>
            <p className="text-xs opacity-50">
              Sound effects generated procedurally.<br/>
              Icons provided by Lucide.<br/>
              Fonts via Google Fonts.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
