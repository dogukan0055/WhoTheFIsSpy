export type Language = 'en' | 'tr';

type Translations = {
  [key: string]: string | Translations;
};

const translations: Record<Language, Translations> = {
  en: {
    // Main Menu
    mainTitle: "WHO THE F*** IS SPY?",
    mainSubtitle: "Deception, deduction, and betrayal. Can you find the impostor among us?",
    offlineMode: "OFFLINE MODE",
    onlineMode: "ONLINE MODE",
    howToPlay: "How to Play",
    
    // Settings
    systemConfig: "SYSTEM CONFIG",
    audioHaptics: "Audio & Haptics",
    soundEffects: "Sound Effects",
    soundDesc: "UI interaction sounds",
    bgAmbience: "Background Ambience",
    bgDesc: "Immersive spy theme audio",
    hapticFeedback: "Haptic Feedback",
    hapticDesc: "Vibrate on interactions",
    accessibility: "Accessibility",
    highContrast: "High Contrast",
    highContrastDesc: "Increase visual distinction",
    language: "Language",
    credits: "CREDITS",
    creditsText: "Designed & Developed by",
    
    // Offline Setup
    missionSetup: "MISSION SETUP",
    agents: "AGENTS",
    spies: "SPIES",
    missionTimer: "MISSION TIMER",
    minutes: "MINUTES",
    manageLocations: "MANAGE LOCATIONS",
    manageRoster: "MANAGE AGENT ROSTER",
    startMission: "START MISSION",
    minMax: "MIN: {min} | MAX: {max}",
    locked: "LOCKED",
    
    // Location Manager
    database: "DATABASE",
    createCategory: "CREATE NEW CATEGORY",
    addLocation: "Add Location",
    newCategory: "New Category",
    newLocationFor: "New Location for {name}",
    confirm: "Confirm",
    create: "Create",
    
    // Game
    agentNum: "Agent {current} / {total}",
    revealIdentity: "Reveal Identity",
    nextAgent: "Next Agent",
    startGame: "Start Mission",
    youAreSpy: "YOU ARE THE SPY",
    spyDesc: "Try to blend in. Figure out the location without getting caught.",
    civilian: "CIVILIAN",
    location: "Location",
    noTimer: "NO TIMER",
    takeYourTime: "Take your time to discuss",
    interrogationPhase: "Interrogation Phase",
    civiliansDesc: "CIVILIANS: Ask questions to verify others. Don't give away the location!",
    spiesDesc: "SPIES: Listen carefully. Infer the location. Blend in with vague answers.",
    agentsActive: "Agents Active",
    spiesRemaining: "Spies Remaining",
    callVote: "Call Vote",
    emergencyMeeting: "Emergency Meeting",
    whoSuspicious: "Who is the most suspicious?",
    cancel: "Cancel",
    eliminate: "Eliminate",
    winner: "Winner",
    secretLocation: "Secret Location",
    spiesWere: "The Spies Were",
    caught: "CAUGHT",
    playAgain: "Play Again",
    backToMenu: "Back to Menu",
    
    // Toasts
    invalidName: "Invalid Name",
    allPlayersNeed: "All players must have a name.",
    nameRejected: "Name Rejected",
    nameNotAllowed: "Name \"{name}\" is not allowed.",
    noLocations: "No Locations",
    selectCategory: "Please select at least one location category in Database.",
    emptyCategory: "Empty Category",
    noCategoryLocs: "Selected category has no locations.",
    categoryAdded: "Category Added",
    addedToDb: "{name} added to database.",
    locationAdded: "Location Added",
    addedToCat: "{name} added to category.",
    actionDenied: "Action Denied",
    coreProtocols: "Core protocols cannot be deleted.",
    lastCategory: "Cannot delete the last category.",
    categoryEmpty: "Category Empty",
    emptyFirst: "Cannot enable empty category. Add locations first.",
    warning: "Warning",
    oneActive: "At least one category must be active.",
    coreLocations: "Core locations cannot be removed.",
    
    // Online
    identifyYourself: "IDENTIFY YOURSELF",
    enterCodename: "Enter your codename to access the encrypted network.",
    codename: "Codename",
    establishUplink: "ESTABLISH UPLINK",
    connectedAs: "CONNECTED AS: {name}",
    createOperation: "CREATE OPERATION",
    hostNewGame: "Host a new game lobby",
    joinOperation: "JOIN OPERATION",
    enterRoom: "Enter an existing room code",
    enterAccessCode: "ENTER ACCESS CODE",
    accessMainframe: "ACCESS MAINFRAME",
    operationCode: "Operation Code",
    waiting: "Waiting for agents...",
    readyToDeploy: "Ready to deploy",
    host: "HOST",
    searching: "Searching Signal...",
    
    // How to Play
    missionBriefing: "MISSION BRIEFING",
    classified: "Classified Information. Read carefully.",
    objective: "OBJECTIVE",
    civObjective: "Civilians: Find the Spy. Ask questions to prove you know the location.",
    spyObjective: "Spy: Blend in. Figure out the location. Don't get caught.",
    gameplay: "GAMEPLAY",
    step1: "Pass the phone around to reveal roles.",
    step2: "Once everyone knows their role, start the timer.",
    step3: "Take turns asking Yes/No questions.",
    step4: "If you suspect someone, call a vote!",
    winConditions: "WIN CONDITIONS",
    spyWins: "Spy Wins if: A civilian is eliminated (unless there are multiple spies), or if spies outnumber civilians, or if timer runs out.",
    civilWins: "Civilians Win if: All spies are eliminated.",
  },
  tr: {
    // Ana Menü
    mainTitle: "CASUSları BUL!",
    mainSubtitle: "Aldatma, çıkarım ve ihanet. Aranızdaki sahtekârı bulabilir misin?",
    offlineMode: "ÇEVRİMDIŞI MOD",
    onlineMode: "ÇEVRİMİÇİ MOD",
    howToPlay: "Nasıl Oynanır",
    
    // Ayarlar
    systemConfig: "SİSTEM AYARLARI",
    audioHaptics: "Ses & Titreşim",
    soundEffects: "Ses Efektleri",
    soundDesc: "Arayüz etkileşim sesleri",
    bgAmbience: "Arka Plan Müziği",
    bgDesc: "Sürükleyici casus teması",
    hapticFeedback: "Dokunsal Geri Bildirim",
    hapticDesc: "Etkileşimlerde titreşim",
    accessibility: "Erişilebilirlik",
    highContrast: "Yüksek Kontrast",
    highContrastDesc: "Görsel ayrımı artır",
    language: "Dil",
    credits: "HAZIRLAYANLAR",
    creditsText: "Tasarlayan & Geliştiren",
    
    // Çevrimdışı Kurulum
    missionSetup: "GÖREV KURULUMU",
    agents: "AJANLAR",
    spies: "CASUSLAR",
    missionTimer: "GÖREV ZAMANI",
    minutes: "DAKİKA",
    manageLocations: "LOKASYONLARI YÖNET",
    manageRoster: "AJAN KADROSUNU YÖNET",
    startMission: "GÖREVİ BAŞLAT",
    minMax: "MIN: {min} | MAKS: {max}",
    locked: "KİLİTLİ",
    
    // Lokasyon Yöneticisi
    database: "VERİ TABANI",
    createCategory: "YENİ KATEGORİ OLUŞTUR",
    addLocation: "Lokasyon Ekle",
    newCategory: "Yeni Kategori",
    newLocationFor: "{name} için Yeni Lokasyon",
    confirm: "Onayla",
    create: "Oluştur",
    
    // Oyun
    agentNum: "Ajan {current} / {total}",
    revealIdentity: "Kimliği Göster",
    nextAgent: "Sonraki Ajan",
    startGame: "Görevi Başlat",
    youAreSpy: "SEN CASUSSUN",
    spyDesc: "Uyum sağlamaya çalış. Lokasyonu anla. Yakalanma.",
    civilian: "SİVİL",
    location: "Lokasyon",
    noTimer: "ZAMAN YOK",
    takeYourTime: "Tartışmak için zamanınız var",
    interrogationPhase: "Sorgulama Aşaması",
    civiliansDesc: "SİVİLLER: Diğerlerini doğrulamak için sorular sorun. Lokasyonu belli etmeyin!",
    spiesDesc: "CASUSLAR: Dikkatle dinleyin. Lokasyonu çıkarın. Belirsiz cevaplarla uyum sağlayın.",
    agentsActive: "Aktif Ajanlar",
    spiesRemaining: "Kalan Casuslar",
    callVote: "Oylama Başlat",
    emergencyMeeting: "Acil Toplantı",
    whoSuspicious: "Kim en şüpheli?",
    cancel: "İptal",
    eliminate: "Elendir",
    winner: "Kazanan",
    secretLocation: "Gizli Lokasyon",
    spiesWere: "Casuslar Şunlardı",
    caught: "YAKALANDI",
    playAgain: "Tekrar Oyna",
    backToMenu: "Ana Menüye Dön",
    
    // Bildirimler
    invalidName: "Geçersiz İsim",
    allPlayersNeed: "Tüm oyuncuların bir ismi olmalı.",
    nameRejected: "İsim Reddedildi",
    nameNotAllowed: "\"{name}\" ismine izin verilmiyor.",
    noLocations: "Lokasyon Yok",
    selectCategory: "Lütfen Veri Tabanı'nda en az bir lokasyon kategorisi seçin.",
    emptyCategory: "Boş Kategori",
    noCategoryLocs: "Seçili kategoride lokasyon yok.",
    categoryAdded: "Kategori Eklendi",
    addedToDb: "{name} veri tabanına eklendi.",
    locationAdded: "Lokasyon Eklendi",
    addedToCat: "{name} kategoriye eklendi.",
    actionDenied: "İşlem Reddedildi",
    coreProtocols: "Temel protokoller silinemez.",
    lastCategory: "Son kategori silinemez.",
    categoryEmpty: "Kategori Boş",
    emptyFirst: "Boş kategori etkinleştirilemez. Önce lokasyon ekleyin.",
    warning: "Uyarı",
    oneActive: "En az bir kategori aktif olmalı.",
    coreLocations: "Temel lokasyonlar kaldırılamaz.",
    
    // Çevrimiçi
    identifyYourself: "KİMLİĞİNİ DOĞRULA",
    enterCodename: "Şifreli ağa erişmek için kod adınızı girin.",
    codename: "Kod Adı",
    establishUplink: "BAĞLANTI KUR",
    connectedAs: "BAĞLANDI: {name}",
    createOperation: "OPERASYON OLUŞTUR",
    hostNewGame: "Yeni oyun odası oluştur",
    joinOperation: "OPERASYONA KATIL",
    enterRoom: "Mevcut oda kodunu gir",
    enterAccessCode: "ERİŞİM KODUNU GİR",
    accessMainframe: "ANA SİSTEME ERİŞ",
    operationCode: "Operasyon Kodu",
    waiting: "Ajanlar bekleniyor...",
    readyToDeploy: "Dağıtmaya hazır",
    host: "HOST",
    searching: "Sinyal aranıyor...",
    
    // Nasıl Oynanır
    missionBriefing: "GÖREV BRİFİNGİ",
    classified: "Gizli Bilgi. Dikkatle okuyun.",
    objective: "AMAÇ",
    civObjective: "Siviller: Casusu bulun. Lokasyonu bildiğinizi kanıtlamak için sorular sorun.",
    spyObjective: "Casus: Uyum sağlayın. Lokasyonu anlayın. Yakalanmayın.",
    gameplay: "OYNANIS",
    step1: "Rolleri açığa çıkarmak için telefonu dolaştırın.",
    step2: "Herkes rolünü öğrendikten sonra, zamanlayıcıyı başlatın.",
    step3: "Sırayla Evet/Hayır soruları sorun.",
    step4: "Birisinden şüpheleniyorsanız, oylama başlatın!",
    winConditions: "KAZANMA KOŞULLARI",
    spyWins: "Casus Kazanır: Bir sivil elenirse (birden fazla casus yoksa), casuslar sivilleri geçerse veya zaman biterse.",
    civilWins: "Siviller Kazanır: Tüm casuslar yakalanırsa.",
  }
};

// Get translation with optional parameter substitution
export function t(key: string, params?: Record<string, string | number>): string {
  const lang = (localStorage.getItem('spy-language') as Language) || 'en';
  const value = translations[lang][key];
  
  if (typeof value !== 'string') {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  // Replace parameters
  if (params) {
    return Object.entries(params).reduce((str, [param, val]) => {
      return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
    }, value);
  }
  
  return value;
}

export function getLanguage(): Language {
  return (localStorage.getItem('spy-language') as Language) || 'en';
}

export function setLanguage(lang: Language) {
  localStorage.setItem('spy-language', lang);
  window.location.reload(); // Reload to apply translations
}
