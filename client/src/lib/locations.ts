// Simple bad word filter
const BANNED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'whore', 'slut', 
  'bastard', 'damn', 'crap', 'piss', 'nigger', 'faggot', 'retard', 'kill', 'die', 'suicide',
  // Turkish bad words
  'amk', 'aq', 'piç', 'yarrak', 'oç', 'orosbu', 'orospu', 'siktir', 'sik', 'göt', 'meme', 'taşak',
  'yarak', 'ibne', 'gavat', 'kaltak', 'fahişe', 'pezevenk', 'amcık'
];

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

export const containsProfanity = (text: string): boolean => {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some(word => lower.includes(word));
};
