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
  },
  {
    id: 'nightlife',
    name: 'Nightlife',
    icon: 'PartyPopper',
    locations: [
      'Karaoke Lounge',
      'Rooftop Bar',
      'Jazz Club',
      'Underground Rave',
      'VIP Casino Room',
      'Late Night Diner',
      'Speakeasy',
      'Comedy Club',
      'Botanical Rooftop',
      'Skybridge Bar'
    ]
  },
  {
    id: 'transit',
    name: 'Transit',
    icon: 'BusFront',
    locations: [
      'Airport Terminal',
      'Train Station',
      'Metro Platform',
      'Harbor Dock',
      'Highway Rest Stop',
      'Border Checkpoint',
      'Subway Control Room',
      'Helipad',
      'Spaceport Gate',
      'Bus Depot'
    ]
  },
  {
    id: 'legends',
    name: 'Legends',
    icon: 'Sparkles',
    locations: [
      'Ancient Temple',
      'Dragon Cave',
      'Floating Bazaar',
      'Wizard Tower',
      'Pirate Cove',
      'Cyberpunk Market',
      'Steampunk Airship',
      'Crystal Cavern',
      'Royal Throne Room',
      'Time Traveler Hub'
    ]
  }
];

// Simple bad word filter
const BANNED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'whore', 'slut',
  'bastard', 'damn', 'crap', 'piss', 'nigger', 'faggot', 'retard', 'kill', 'die', 'suicide',
  // Turkish profanity
  'amk', 'aq', 'orospu', 'orospu çocuğu', 'piç', 'oç', 'göt', 'götveren', 'siktir', 'sikerim',
  'yarrak', 'yarak', 'ibne', 'pezevenk', 'sıç', 'bok', 'kahpe'
];

export const containsProfanity = (text: string): boolean => {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some(word => lower.includes(word));
};

export const toLocationKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

export const CATEGORY_LABELS: Record<string, { en: string; tr: string }> = {
  standard: { en: 'Standard', tr: 'Klasik' },
  vacation: { en: 'Vacation', tr: 'Tatilde' },
  work: { en: 'Workplace', tr: 'İş Yeri' },
  nightlife: { en: 'Nightlife', tr: 'Gece Hayatı' },
  transit: { en: 'Transit', tr: 'Ulaşım' },
  legends: { en: 'Legends', tr: 'Efsaneler' },
};

export const LOCATION_LABELS: Record<string, { en: string; tr: string }> = {
  // Standard
  [toLocationKey('Hospital')]: { en: 'Hospital', tr: 'Hastane' },
  [toLocationKey('School')]: { en: 'School', tr: 'Okul' },
  [toLocationKey('Police Station')]: { en: 'Police Station', tr: 'Karakol' },
  [toLocationKey('Supermarket')]: { en: 'Supermarket', tr: 'Süpermarket' },
  [toLocationKey('Cinema')]: { en: 'Cinema', tr: 'Sinemalar' },
  [toLocationKey('Restaurant')]: { en: 'Restaurant', tr: 'Restoran' },
  [toLocationKey('Hotel')]: { en: 'Hotel', tr: 'Otel' },
  [toLocationKey('Bank')]: { en: 'Bank', tr: 'Banka' },
  [toLocationKey('Airplane')]: { en: 'Airplane', tr: 'Uçak' },
  [toLocationKey('Library')]: { en: 'Library', tr: 'Kütüphane' },

  // Vacation
  [toLocationKey('Beach')]: { en: 'Beach', tr: 'Plaj' },
  [toLocationKey('Ski Resort')]: { en: 'Ski Resort', tr: 'Kayak Merkezi' },
  [toLocationKey('Cruise Ship')]: { en: 'Cruise Ship', tr: 'Cruise Gemisi' },
  [toLocationKey('Camping Site')]: { en: 'Camping Site', tr: 'Kamp Alanı' },
  [toLocationKey('Theme Park')]: { en: 'Theme Park', tr: 'Lunapark' },
  [toLocationKey('Museum')]: { en: 'Museum', tr: 'Müze' },
  [toLocationKey('Spa')]: { en: 'Spa', tr: 'Spa Merkezi' },
  [toLocationKey('Casino')]: { en: 'Casino', tr: 'Kumarhane' },
  [toLocationKey('Zoo')]: { en: 'Zoo', tr: 'Hayvanat Bahçesi' },
  [toLocationKey('National Park')]: { en: 'National Park', tr: 'Milli Park' },

  // Work
  [toLocationKey('Office')]: { en: 'Office', tr: 'Ofis' },
  [toLocationKey('Construction Site')]: { en: 'Construction Site', tr: 'Şantiye' },
  [toLocationKey('Studio')]: { en: 'Studio', tr: 'Stüdyo' },
  [toLocationKey('Laboratory')]: { en: 'Laboratory', tr: 'Laboratuvar' },
  [toLocationKey('Factory')]: { en: 'Factory', tr: 'Fabrika' },
  [toLocationKey('Farm')]: { en: 'Farm', tr: 'Çiftlik' },
  [toLocationKey('Space Station')]: { en: 'Space Station', tr: 'Uzay İstasyonu' },
  [toLocationKey('Submarine')]: { en: 'Submarine', tr: 'Denizaltı' },
  [toLocationKey('Fire Station')]: { en: 'Fire Station', tr: 'İtfaiye' },
  [toLocationKey('News Room')]: { en: 'News Room', tr: 'Haber Merkezi' },

  // Nightlife
  [toLocationKey('Karaoke Lounge')]: { en: 'Karaoke Lounge', tr: 'Karaoke Salonu' },
  [toLocationKey('Rooftop Bar')]: { en: 'Rooftop Bar', tr: 'Çatı Bar' },
  [toLocationKey('Jazz Club')]: { en: 'Jazz Club', tr: 'Caz Kulübü' },
  [toLocationKey('Underground Rave')]: { en: 'Underground Rave', tr: 'Yeraltı Parti' },
  [toLocationKey('VIP Casino Room')]: { en: 'VIP Casino Room', tr: 'VIP Kumar Salonu' },
  [toLocationKey('Late Night Diner')]: { en: 'Late Night Diner', tr: 'Gece Lokantası' },
  [toLocationKey('Speakeasy')]: { en: 'Speakeasy', tr: 'Gizli Bar' },
  [toLocationKey('Comedy Club')]: { en: 'Comedy Club', tr: 'Komedi Kulübü' },
  [toLocationKey('Botanical Rooftop')]: { en: 'Botanical Rooftop', tr: 'Botanik Teras' },
  [toLocationKey('Skybridge Bar')]: { en: 'Skybridge Bar', tr: 'Gökyüzü Köprüsü Barı' },

  // Transit
  [toLocationKey('Airport Terminal')]: { en: 'Airport Terminal', tr: 'Havalimanı Terminali' },
  [toLocationKey('Train Station')]: { en: 'Train Station', tr: 'Tren Garı' },
  [toLocationKey('Metro Platform')]: { en: 'Metro Platform', tr: 'Metro Peronu' },
  [toLocationKey('Harbor Dock')]: { en: 'Harbor Dock', tr: 'Liman İskelesi' },
  [toLocationKey('Highway Rest Stop')]: { en: 'Highway Rest Stop', tr: 'Otoyol Mola Tesisi' },
  [toLocationKey('Border Checkpoint')]: { en: 'Border Checkpoint', tr: 'Sınır Kapısı' },
  [toLocationKey('Subway Control Room')]: { en: 'Subway Control Room', tr: 'Metro Kontrol Odası' },
  [toLocationKey('Helipad')]: { en: 'Helipad', tr: 'Helikopter Pisti' },
  [toLocationKey('Spaceport Gate')]: { en: 'Spaceport Gate', tr: 'Uzay Limanı Kapısı' },
  [toLocationKey('Bus Depot')]: { en: 'Bus Depot', tr: 'Otobüs Garajı' },

  // Legends
  [toLocationKey('Ancient Temple')]: { en: 'Ancient Temple', tr: 'Kadim Tapınak' },
  [toLocationKey('Dragon Cave')]: { en: 'Dragon Cave', tr: 'Ejderha Mağarası' },
  [toLocationKey('Floating Bazaar')]: { en: 'Floating Bazaar', tr: 'Yüzen Pazar' },
  [toLocationKey('Wizard Tower')]: { en: 'Wizard Tower', tr: 'Büyücü Kulesi' },
  [toLocationKey('Pirate Cove')]: { en: 'Pirate Cove', tr: 'Korsan Koyu' },
  [toLocationKey('Cyberpunk Market')]: { en: 'Cyberpunk Market', tr: 'Siber Pazar' },
  [toLocationKey('Steampunk Airship')]: { en: 'Steampunk Airship', tr: 'Buhar Gemisi' },
  [toLocationKey('Crystal Cavern')]: { en: 'Crystal Cavern', tr: 'Kristal Mağara' },
  [toLocationKey('Royal Throne Room')]: { en: 'Royal Throne Room', tr: 'Kraliyet Taht Salonu' },
  [toLocationKey('Time Traveler Hub')]: { en: 'Time Traveler Hub', tr: 'Zaman Yolcusu Üssü' },
};
