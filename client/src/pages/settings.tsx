import React from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Music, Eye, EyeOff, Languages } from 'lucide-react';
import { Link } from 'wouter';
import { playSound } from '@/lib/audio';
import { t, getLanguage, setLanguage, type Language } from '@/lib/i18n';

export default function Settings() {
  const { state, dispatch } = useGame();
  const { sound, vibrate, music, highContrast } = state.appSettings;
  const currentLang = getLanguage();

  const toggleSetting = (key: keyof typeof state.appSettings) => {
    dispatch({ 
      type: 'UPDATE_APP_SETTINGS', 
      payload: { [key]: !state.appSettings[key] } 
    });
    playSound('click');
  };

  const handleLanguageChange = (lang: Language) => {
    playSound('click');
    setLanguage(lang);
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" onClick={() => playSound('click')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-mono ml-2">{t('systemConfig')}</h1>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">{t('language')}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  currentLang === 'en' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">🇬🇧</span>
                <span className="font-bold font-mono">EN</span>
              </button>
              <button
                onClick={() => handleLanguageChange('tr')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  currentLang === 'tr' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">🇹🇷</span>
                <span className="font-bold font-mono">TR</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">{t('audioHaptics')}</h2>
          </div>
          
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sound ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <Label className="text-base">{t('soundEffects')}</Label>
                  <p className="text-xs text-muted-foreground">{t('soundDesc')}</p>
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
                  <Label className="text-base">{t('bgAmbience')}</Label>
                  <p className="text-xs text-muted-foreground">{t('bgDesc')}</p>
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
                  <Label className="text-base">{t('hapticFeedback')}</Label>
                  <p className="text-xs text-muted-foreground">{t('hapticDesc')}</p>
                </div>
              </div>
              <Switch checked={vibrate} onCheckedChange={() => toggleSetting('vibrate')} />
            </div>
          </div>
        </div>

        <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-white/10">
            <h2 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">{t('accessibility')}</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${highContrast ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                   {highContrast ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <Label className="text-base">{t('highContrast')}</Label>
                  <p className="text-xs text-muted-foreground">{t('highContrastDesc')}</p>
                </div>
              </div>
              <Switch checked={highContrast} onCheckedChange={() => toggleSetting('highContrast')} />
            </div>
          </div>
        </div>

        <div className="pt-8 text-center space-y-2">
          <h3 className="text-xs font-mono text-muted-foreground">{t('credits')}</h3>
          <div className="p-4 bg-card/10 rounded-lg text-sm text-muted-foreground border border-white/5">
            <p className="mb-2">{t('creditsText')}</p>
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
