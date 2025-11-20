import { Language } from './game-context';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    // Home
    'home.title': 'WHO THE F*** IS SPY?',
    'home.subtitle': 'Deception, deduction, and betrayal. Can you find the impostor among us?',
    'home.offline': 'OFFLINE MODE',
    'home.online': 'ONLINE MODE',
    'home.howToPlay': 'How to Play',
    'home.settings': 'Settings',
    
    // Setup
    'setup.title': 'MISSION SETUP',
    'setup.agents': 'AGENTS',
    'setup.spies': 'SPIES',
    'setup.timer': 'MISSION TIMER',
    'setup.manageLocations': 'MANAGE LOCATIONS',
    'setup.manageRoster': 'MANAGE AGENT ROSTER',
    'setup.start': 'START MISSION',
    'setup.min': 'MIN',
    'setup.max': 'MAX',
    'setup.minutes': 'MINUTES',
    'setup.agent': 'Agent',
    'setup.locked': 'LOCKED',
    'setup.spyMax': '1 SPY MAX',

    // Reveal
    'reveal.player': 'Agent',
    'reveal.pass': 'Pass the phone to',
    'reveal.tap': 'Tap below to reveal your role',
    'reveal.spyTitle': 'YOU ARE THE SPY',
    'reveal.spyDesc': 'Try to blend in. Figure out the location without getting caught.',
    'reveal.civTitle': 'CIVILIAN',
    'reveal.location': 'Location',
    'reveal.next': 'Next Agent',
    'reveal.start': 'Start Mission',
    'reveal.reveal': 'Reveal Identity',
    
    // Discussion
    'discussion.noTimer': 'NO TIMER',
    'discussion.takeTime': 'Take your time to discuss',
    'discussion.phase': 'Interrogation Phase',
    'discussion.civInst': 'CIVILIANS: Ask questions to verify others. Don\'t give away the location!',
    'discussion.spyInst': 'SPIES: Listen carefully. Infer the location. Blend in with vague answers.',
    'discussion.active': 'Agents Active',
    'discussion.spiesLeft': 'Spies Remaining',
    'discussion.callVote': 'Call Vote',
    
    // Voting
    'voting.title': 'Emergency Meeting',
    'voting.desc': 'Who is the most suspicious?',
    'voting.cancel': 'Cancel',
    'voting.eliminate': 'Eliminate',
    
    // Result
    'result.winner': 'Winner',
    'result.spiesWin': 'SPIES',
    'result.civsWin': 'CIVILIANS',
    'result.secretLoc': 'Secret Location',
    'result.spiesWere': 'The Spies Were',
    'result.caught': 'CAUGHT',
    'result.playAgain': 'Play Again',
    'result.backMenu': 'Back to Menu',

    // Settings
    'settings.title': 'SYSTEM CONFIG',
    'settings.audio': 'Audio & Haptics',
    'settings.sound': 'Sound Effects',
    'settings.soundDesc': 'UI interaction sounds',
    'settings.ambience': 'Background Ambience',
    'settings.ambienceDesc': 'Immersive spy theme audio',
    'settings.haptic': 'Haptic Feedback',
    'settings.hapticDesc': 'Vibrate on interactions',
    'settings.accessibility': 'Accessibility',
    'settings.highContrast': 'High Contrast',
    'settings.highContrastDesc': 'Increase visual distinction',
    'settings.language': 'Language / Dil',
    'settings.credits': 'CREDITS',
    'settings.designedBy': 'Designed & Developed by',

    // Database
    'db.title': 'DATABASE',
    'db.create': 'CREATE NEW CATEGORY',
    'db.addLoc': 'Add Location',
    'db.confirm': 'Confirm',
    'db.newCat': 'New Category',
    'db.newLoc': 'New Location for',
    
    // Toasts
    'toast.invalidName': 'Invalid Name',
    'toast.allPlayersName': 'All players must have a name.',
    'toast.nameRejected': 'Name Rejected',
    'toast.nameNotAllowed': 'Name is not allowed.',
    'toast.noLocations': 'No Locations',
    'toast.selectOne': 'Please select at least one location category in Database.',
    'toast.emptyCat': 'Empty Category',
    'toast.catEmpty': 'Selected category has no locations.',
    'toast.catAdded': 'Category Added',
    'toast.locAdded': 'Location Added',
    'toast.actionDenied': 'Action Denied',
    'toast.lastCat': 'Cannot delete the last category.',
    'toast.coreProtocols': 'Core protocols cannot be deleted.',
    'toast.coreLoc': 'Core locations cannot be removed.',
    'toast.spyCaught': 'SPY CAUGHT!',
    'toast.spyCaughtDesc': 'A spy has been eliminated. The mission continues!',
  },
  tr: {
    // Home
    'home.title': 'CASUS KİM A.Q?',
    'home.subtitle': 'Aldatmaca, çıkarım ve ihanet. Aramızdaki haini bulabilir misin?',
    'home.offline': 'ÇEVRİMDIŞI MOD',
    'home.online': 'ÇEVRİMİÇİ MOD',
    'home.howToPlay': 'Nasıl Oynanır',
    'home.settings': 'Ayarlar',

    // Setup
    'setup.title': 'GÖREV KURULUMU',
    'setup.agents': 'AJANLAR',
    'setup.spies': 'CASUSLAR',
    'setup.timer': 'GÖREV SÜRESİ',
    'setup.manageLocations': 'LOKASYONLARI YÖNET',
    'setup.manageRoster': 'AJAN LİSTESİNİ DÜZENLE',
    'setup.start': 'GÖREVİ BAŞLAT',
    'setup.min': 'MİN',
    'setup.max': 'MAKS',
    'setup.minutes': 'DAKİKA',
    'setup.agent': 'Ajan',
    'setup.locked': 'KİLİTLİ',
    'setup.spyMax': '1 CASUS MAKS',

    // Reveal
    'reveal.player': 'Ajan',
    'reveal.pass': 'Telefonu şuna ver:',
    'reveal.tap': 'Rolünü görmek için dokun',
    'reveal.spyTitle': 'SEN CASUSSUN',
    'reveal.spyDesc': 'Dikkat çekmemeye çalış. Yakalanmadan lokasyonu tahmin et.',
    'reveal.civTitle': 'SİVİL',
    'reveal.location': 'Lokasyon',
    'reveal.next': 'Sıradaki Ajan',
    'reveal.start': 'Görevi Başlat',
    'reveal.reveal': 'Kimliği Göster',

    // Discussion
    'discussion.noTimer': 'SÜRE YOK',
    'discussion.takeTime': 'Tartışmak için acele etmeyin',
    'discussion.phase': 'Sorgu Aşaması',
    'discussion.civInst': 'SİVİLLER: Diğerlerini doğrulamak için sorular sorun. Lokasyonu açık etmeyin!',
    'discussion.spyInst': 'CASUSLAR: Dikkatlice dinleyin. Lokasyonu tahmin etmeye çalışın. Kaçamak cevaplarla gizlenin.',
    'discussion.active': 'Aktif Ajanlar',
    'discussion.spiesLeft': 'Kalan Casus',
    'discussion.callVote': 'Oylama Başlat',

    // Voting
    'voting.title': 'Acil Durum Toplantısı',
    'voting.desc': 'En şüpheli kim?',
    'voting.cancel': 'İptal',
    'voting.eliminate': 'Ortadan Kaldır',

    // Result
    'result.winner': 'Kazanan',
    'result.spiesWin': 'CASUSLAR',
    'result.civsWin': 'SİVİLLER',
    'result.secretLoc': 'Gizli Lokasyon',
    'result.spiesWere': 'Casuslar Şunlardı',
    'result.caught': 'YAKALANDI',
    'result.playAgain': 'Tekrar Oyna',
    'result.backMenu': 'Menüye Dön',

    // Settings
    'settings.title': 'SİSTEM AYARLARI',
    'settings.audio': 'Ses & Titreşim',
    'settings.sound': 'Ses Efektleri',
    'settings.soundDesc': 'Arayüz etkileşim sesleri',
    'settings.ambience': 'Arkaplan Ambiyansı',
    'settings.ambienceDesc': 'Casus temalı atmosfer sesi',
    'settings.haptic': 'Titreşim Geri Bildirimi',
    'settings.hapticDesc': 'Etkileşimlerde titreşim',
    'settings.accessibility': 'Erişilebilirlik',
    'settings.highContrast': 'Yüksek Karşıtlık',
    'settings.highContrastDesc': 'Görsel ayrımı artır',
    'settings.language': 'Dil / Language',
    'settings.credits': 'EMEĞİ GEÇENLER',
    'settings.designedBy': 'Tasarım & Geliştirme',

    // Database
    'db.title': 'VERİTABANI',
    'db.create': 'YENİ KATEGORİ OLUŞTUR',
    'db.addLoc': 'Lokasyon Ekle',
    'db.confirm': 'Onayla',
    'db.newCat': 'Yeni Kategori',
    'db.newLoc': 'Yeni Lokasyon:',

    // Toasts
    'toast.invalidName': 'Geçersiz İsim',
    'toast.allPlayersName': 'Tüm oyuncuların bir ismi olmalı.',
    'toast.nameRejected': 'İsim Reddedildi',
    'toast.nameNotAllowed': 'Bu isim kullanılamaz.',
    'toast.noLocations': 'Lokasyon Yok',
    'toast.selectOne': 'Lütfen Veritabanından en az bir kategori seçin.',
    'toast.emptyCat': 'Boş Kategori',
    'toast.catEmpty': 'Seçilen kategoride lokasyon yok.',
    'toast.catAdded': 'Kategori Eklendi',
    'toast.locAdded': 'Lokasyon Eklendi',
    'toast.actionDenied': 'İşlem Reddedildi',
    'toast.lastCat': 'Son kalan kategori silinemez.',
    'toast.coreProtocols': 'Ana protokoller silinemez.',
    'toast.coreLoc': 'Ana lokasyonlar kaldırılamaz.',
    'toast.spyCaught': 'CASUS YAKALANDI!',
    'toast.spyCaughtDesc': 'Bir casus ortadan kaldırıldı. Görev devam ediyor!',
  }
};

export const useTranslation = (lang: Language) => {
  return (key: string) => {
    return translations[lang][key] || key;
  };
};
