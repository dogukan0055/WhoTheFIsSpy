import { useGame } from '@/lib/game-context';
import { translate } from '@/lib/i18n';

export const useTranslation = () => {
  const { state } = useGame();
  const language = state.appSettings.language;

  const t = (key: string) => translate(language, key);

  return { t, language };
};
