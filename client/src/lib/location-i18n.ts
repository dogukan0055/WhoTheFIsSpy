import { CATEGORY_LABELS, LOCATION_LABELS, toLocationKey, Category } from './locations';
import { Language } from './i18n';

export const getCategoryName = (language: Language, category: Category) =>
  CATEGORY_LABELS[category.id]?.[language] ?? category.name;

export const getLocationName = (language: Language, location: string) => {
  const key = toLocationKey(location);
  return LOCATION_LABELS[key]?.[language] ?? location;
};
