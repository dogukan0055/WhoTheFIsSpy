export type Category = {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  locations: string[];
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'standard',
    name: 'Standard',
    icon: 'Map',
    locations: [
      'Hospital',
      'School',
      'Police Station',
      'Supermarket',
      'Cinema',
      'Restaurant',
      'Hotel',
      'Bank',
      'Airplane',
      'Library'
    ]
  },
  {
    id: 'vacation',
    name: 'Vacation',
    icon: 'Palmtree',
    locations: [
      'Beach',
      'Ski Resort',
      'Cruise Ship',
      'Camping Site',
      'Theme Park',
      'Museum',
      'Spa',
      'Casino',
      'Zoo',
      'National Park'
    ]
  },
  {
    id: 'work',
    name: 'Workplace',
    icon: 'Briefcase',
    locations: [
      'Office',
      'Construction Site',
      'Studio',
      'Laboratory',
      'Factory',
      'Farm',
      'Space Station',
      'Submarine',
      'Fire Station',
      'News Room'
    ]
  }
];

// Enhanced bad word filter with Turkish words
const BANNED_WORDS = [
  // English
  'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'whore', 'slut', 
  'bastard', 'damn', 'crap', 'piss', 'nigger', 'faggot', 'retard', 'kill', 'die', 'suicide',
  // Turkish
  'siktir', 'amk', 'orospu', 'piç', 'göt', 'yarrak', 'am', 'sik', 'amcık', 'pezevenk',
  'kahpe', 'ibne', 'puşt', 'döl', 'taşak', 'meme', 'sıçmak', 'bok', 'mal', 'aptal',
  'salak', 'gerizekalı', 'beyinsiz', 'amına', 'sikik', 'sikim', 'ananı', 'anasını'
];

export const containsProfanity = (text: string): boolean => {
  const lower = text.toLowerCase()
    .replace(/[İı]/g, 'i') // Turkish i/İ normalization
    .replace(/[ğĞ]/g, 'g')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c');
  
  return BANNED_WORDS.some(word => {
    // Check if word exists as whole word or substring
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return regex.test(lower);
  });
};

// Validate UTF-8 player name (allow all Unicode letters and spaces)
export const isValidPlayerName = (name: string): boolean => {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 16) return false;
  
  // Allow Unicode letters (\p{L}), spaces, and common diacritics
  // Block special chars, numbers, emojis
  const validPattern = /^[\p{L}\s]+$/u;
  return validPattern.test(name);
};

// Get saved player names from localStorage
export const getSavedPlayerNames = (): string[] => {
  const saved = localStorage.getItem('spy-player-names');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

// Save player names to localStorage
export const savePlayerNames = (names: string[]) => {
  localStorage.setItem('spy-player-names', JSON.stringify(names));
};
