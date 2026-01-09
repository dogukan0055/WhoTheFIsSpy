import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../models/game_models.dart';

class SpyLocalizations {
  SpyLocalizations(this.locale)
      : language = locale.languageCode.toLowerCase() == 'tr'
            ? Language.tr
            : Language.en;

  final Locale locale;
  final Language language;

  static const supported = ['en', 'tr'];

  static const _strings = {
    'en': {
      'welcomeTitle': 'Welcome, Agent',
      'welcomeBody':
          'A spy hides among you. Keep your answers vague, but sharp.',
      'appTitleTop': 'THE',
      'appTitleMid': 'MOLE WITHIN',
      'appTitleBottom': '',
      'secretTitle': 'Reveal in Secret',
      'secretBody':
          'Pass the device and scan to reveal your identity. No peeking.',
      'interrogateTitle': 'Interrogate & Vote',
      'interrogateBody':
          'Ask pointed questions, call a vote, and catch the impostor.',
      'skip': 'Skip',
      'next': 'Next',
      'enterMission': 'Enter Mission',
      'missionSetup': 'Mission Setup',
      'startMission': 'Start Mission',
      'agents': 'Agents',
      'agentsHelper':
          'In normal circumstances, at least 4 agents are required. You can have up to 8 agents in a mission.',
      'spies': 'Spies',
      'spiesHelperLocked':
          'Only one spy can exist when there are less than 5 agents in the field.',
      'spiesHelper':
          'If there are more than 5 agents, you can have up to 2 spies in the mission.',
      'missionTimer': 'Operation Duration',
      'noTimer': 'No timer active. Take your time.',
      'timerLength': 'You have {minutes} minutes to catch the spy.',
      'manageLocations': 'Manage Locations',
      'manageRoster': 'Manage Agent Roster',
      'lockedDueToAgents': 'Locked due to agents count.',
      'systemConfig': 'System Config',
      'soundEffects': 'Sound Effects',
      'uiBeeps': 'UI interaction beeps',
      'backgroundAmbience': 'Background Ambience',
      'atmosphericMusic': 'Atmospheric music',
      'haptics': 'Haptics',
      'vibrate': 'Vibrate on actions',
      'highContrast': 'High Contrast',
      'highContrastDesc': 'More separation between layers',
      'language': 'Language',
      'languageSubtitle': 'Türkçe / English',
      'credits': 'Credits',
      'designedBy': 'Designed and developed by Doğukan Şıhman',
      'thanks': 'Special thanks to my lovely wife Deniz.',
      'homeTagline': 'Deception, deduction, betrayal.',
      'offlineMode': 'OFFLINE MODE',
      'onlineMode': 'ONLINE MODE (COMING SOON)',
      'onlineComing': 'Online mode coming soon',
      'howToPlay': 'How to play',
      'missionBriefing': 'Mission Briefing',
      'objective': 'Objective',
      'objectiveAgent':
          '• Agents: Find the spy without revealing the location.',
      'objectiveSpy':
          '• Spy: Blend in. Identify the location before being caught.',
      'gameplay': 'Gameplay',
      'gameplayStep1': '1) Pass the phone, reveal your role.',
      'gameplayStep2': '2) Start the timer and ask sharp questions.',
      'gameplayStep3': '3) Call a vote when someone feels suspicious.',
      'winConditions': 'Win Conditions',
      'spyWins': '• Spy wins if an agent is eliminated or time expires.',
      'agentsWin': '• Agents win if all spies are caught.',
      'swipeHint': 'Swipe down or tap outside to dismiss',
      'toggleTheme': 'Toggle theme',
      'noMission': 'No mission in progress.',
      'backToMenu': 'Back to menu',
      'identityReveal': 'Identity Reveal',
      'interrogationPhase': 'Interrogation Phase',
      'vote': 'Vote',
      'results': 'Results',
      'holdToScan': 'Hold finger to scan',
      'nextAgent': 'Next Agent',
      'youAreSpy': 'You are the SPY',
      'agent': 'Agent',
      'secretLocation': 'Secret Location',
      'blendIn': 'Blend in. Listen closely and guess the location.',
      'noTimerShort': 'No timer',
      'agentsActive': 'Agents Active',
      'agentsActiveField': 'Agents Active in the Field',
      'spiesRemaining': 'Remaining Spies',
      'callVote': 'Call Vote',
      'pause': 'Pause Mission',
      'pauseTitle': 'Mission Paused',
      'pauseSubtitle':
          'You can resume the mission when you are ready or return to the main menu.',
      'continue': 'Continue',
      'mainMenu': 'Main Menu',
      'leaveMission': 'Leave Mission?',
      'returnToMenu': 'Are you sure you want to return to the main menu?',
      'stay': 'Stay',
      'yes': 'Yes',
      'timerPaused': 'Timer paused during voting',
      'minutesRemaining': '{minutes} minutes remaining',
      'minuteRemaining': '1 minute remaining',
      'emergencyMeeting': 'Emergency meeting',
      'cancel': 'Cancel',
      'eliminate': 'Eliminate',
      'spiesWin': 'Spies win',
      'agentsWinResult': 'Agents win',
      'secretLocationReveal': 'Secret location: {location}',
      'spiesHeader': 'Spies',
      'caught': 'Caught',
      'playAgain': 'Play again',
      'agentRoster': 'Agent Roster',
      'save': 'Save',
      'saveRoster': 'Save Roster',
      'timerOff': 'No timer',
      'locationDb': 'Location Database',
      'customCategoryHint':
          'Tap + to add a custom category. Default categories cannot be edited.',
      'addCategory': 'Add category',
      'newCategory': 'New Category',
      'categoryHint': 'Ex: Cafes',
      'addLocation': 'Add location',
      'addLocationTo': 'Add location to {category}',
      'locationHint': 'Ex: Submarine base',
      'activeCount': 'Active {active} / {total}',
      'needActiveLocation': 'Add at least one active location first.',
      'needCategory': 'At least one category is required.',
      'max16': 'Max 16 characters allowed.',
      'confirmDeleteCategory': 'Delete category "{name}"?',
      'confirmDeleteLocation': 'Delete location "{name}"?',
      'renameCategory': 'Rename Category',
      'renameLocation': 'Rename Location',
      'renameSuccess': 'Location name is updated as "{name}".',
      'deleteSuccess': 'Location "{name}" is removed.',
      'addedCategory': 'Category "{name}" added.',
      'addedLocation': 'Location "{name}" added.',
      'addedLocationTo': 'Location "{loc}" added to "{cat}".',
      'deletedCategory': 'Category "{name}" deleted.',
      'categoryRenamed': 'Category renamed to "{name}".',
      'editHint':
          'Long-press to rename, double-tap to delete custom locations.',
      'onlineUnavailable': 'Online mode coming soon',
      'codeNameRequired': 'All players need a codename.',
      'maxNameLength': 'Names must be 16 characters or fewer.',
      'lettersOnly': 'Names can only contain letters and spaces.',
      'nameNotAllowed': '"{name}" is not allowed.',
      'noDuplicates': 'Duplicate names are not allowed.',
      'namesSaved': 'Agent names saved.',
      'locationsSaved': 'Locations saved.',
      'selectCategory': 'Select at least one location category.',
      'noLocationsSelected': 'Selected categories do not have any locations.',
    },
    'tr': {
      'welcomeTitle': 'Hoş geldin Ajan',
      'welcomeBody':
          'İçinizde bir casus var. Cevapların net olsun ama gizli kal.',
      'appTitleTop': 'KÖSTEBEK',
      'appTitleMid': 'ARAMIZDA',
      'appTitleBottom': '',
      'secretTitle': 'Gizlice Açığa Çık',
      'secretBody':
          'Cihazı sırayla ver ve kimliğini tarayarak öğren. Sakın bakma.',
      'interrogateTitle': 'Sorgula ve Oyla',
      'interrogateBody':
          'Keskin sorular sor, oylama başlat ve sahtekârı yakala.',
      'skip': 'Geç',
      'next': 'İleri',
      'enterMission': 'Göreve Gir',
      'missionSetup': 'Görev Hazırlığı',
      'startMission': 'Görevi Başlat',
      'agents': 'Ajanlar',
      'agentsHelper':
          'Normal şartlarda en az 4 ajana ihtiyaç var. Bir görevde ise en fazla 8 ajan olabilir.',
      'spies': 'Casuslar',
      'spiesHelperLocked':
          '5 ajandan az olduğunda yalnızca bir casus olabilir.',
      'spiesHelper': '5 ajandan fazlaysa görevde en fazla 2 casus olabilir.',
      'missionTimer': 'Operasyon Süresi',
      'noTimer': 'Süre sınırı yok. Acele etmeyin.',
      'timerLength': 'Casusu yakalamak için {minutes} dakikanız var',
      'manageLocations': 'Lokasyonları Yönet',
      'manageRoster': 'Ajan Kadrosunu Yönet',
      'lockedDueToAgents': 'Ajan sayısı nedeniyle kilitli.',
      'systemConfig': 'Sistem Ayarları',
      'soundEffects': 'Ses Efektleri',
      'uiBeeps': 'Arayüz etkileşim sesleri',
      'backgroundAmbience': 'Arka Plan Müziği',
      'atmosphericMusic': 'Atmosferik müzik',
      'haptics': 'Titreşim',
      'vibrate': 'Hareketlerde titreştir',
      'highContrast': 'Yüksek Kontrast',
      'highContrastDesc': 'Katmanlar arasında daha fazla ayrım',
      'language': 'Dil',
      'languageSubtitle': 'Türkçe / English',
      'credits': 'Emeği Geçenler',
      'designedBy': 'Tasarım ve geliştirme: Doğukan Şıhman',
      'thanks': 'Sevgili eşim Deniz’e özel teşekkürler.',
      'homeTagline': 'Aldatma, sezgi, ihanet.',
      'offlineMode': 'ÇEVRİMDIŞI MOD',
      'onlineMode': 'ÇEVRİMİÇİ MOD (ÇOK YAKINDA)',
      'onlineComing': 'Çevrimiçi mod çok yakında',
      'howToPlay': 'Nasıl oynanır',
      'missionBriefing': 'Görev Brifingi',
      'objective': 'Amaç',
      'objectiveAgent': '• Ajanlar: Lokasyonu belli etmeden casusu bul.',
      'objectiveSpy': '• Casus: Fark edilme. Lokasyonu öğren ve hayatta kal.',
      'gameplay': 'Oynanış',
      'gameplayStep1': '1) Telefonu sırayla ver, rolünü aç.',
      'gameplayStep2': '2) Zamanlayıcıyı başlat ve keskin sorular sor.',
      'gameplayStep3': '3) Şüphelenince oylama başlat.',
      'winConditions': 'Kazanma Şartları',
      'spyWins': '• Casus, bir ajan elenirse veya süre biterse kazanır.',
      'agentsWin': '• Tüm casuslar yakalanırsa ajanlar kazanır.',
      'swipeHint': 'Çıkmak için aşağı kaydır veya dışarı tıkla',
      'toggleTheme': 'Temayı değiştir',
      'noMission': 'Devam eden bir görev yok.',
      'backToMenu': 'Menüye dön',
      'identityReveal': 'Kimlik Açıklama',
      'interrogationPhase': 'Sorgu Aşaması',
      'vote': 'Oylama',
      'results': 'Sonuçlar',
      'holdToScan': 'Tarama için basılı tut',
      'nextAgent': 'Sonraki Ajan',
      'youAreSpy': 'Sen CASUSSUN',
      'agent': 'Ajan',
      'secretLocation': 'Gizli Lokasyon',
      'blendIn': 'Uyum sağla. Dikkatlice dinle ve lokasyonu tahmin et.',
      'noTimerShort': 'Zamanlayıcı yok',
      'agentsActive': 'Aktif Ajan',
      'agentsActiveField': 'Sahadaki Aktif Ajanlar',
      'spiesRemaining': 'Kalan Casuslar',
      'callVote': 'Oylama Başlat',
      'pause': 'Görevi Duraklat',
      'pauseTitle': 'Görev Duraklatıldı',
      'pauseSubtitle':
          'Hazır olduğunda oyuna kaldığın yerden devam edebilir ya da ana menüye dönebilirsin.',
      'continue': 'Devam Et',
      'mainMenu': 'Ana Menü',
      'leaveMission': 'Görevden Çıkılsın mı?',
      'returnToMenu': 'Ana menüye dönmek istediğine emin misin?',
      'stay': 'Kal',
      'yes': 'Evet',
      'emergencyMeeting': 'Acil toplantı',
      'cancel': 'Vazgeç',
      'eliminate': 'Ele',
      'timerPaused': 'Oylamada zamanlayıcı durdu',
      'minutesRemaining': '{minutes} dakika kaldı',
      'minuteRemaining': '1 dakika kaldı',
      'spiesWin': 'Casuslar kazandı',
      'agentsWinResult': 'Ajanlar kazandı',
      'secretLocationReveal': 'Gizli lokasyon: {location}',
      'spiesHeader': 'Casuslar',
      'caught': 'Yakalandı',
      'playAgain': 'Tekrar oyna',
      'agentRoster': 'Ajan Listesi',
      'save': 'Kaydet',
      'saveRoster': 'Listeyi Kaydet',
      'timerOff': 'Zamanlayıcı yok',
      'locationDb': 'Lokasyon Veritabanı',
      'customCategoryHint':
          'Özel kategori eklemek için + butonuna dokunun. Varsayılan kategoriler düzenlenemez.',
      'addCategory': 'Kategori ekle',
      'newCategory': 'Yeni Kategori',
      'categoryHint': 'Örn: Kafeler',
      'addLocation': 'Lokasyon ekle',
      'addLocationTo': '{category} kategorisine lokasyon ekle',
      'locationHint': 'Örn: Denizaltı üssü',
      'activeCount': 'Aktif {active} / {total}',
      'needActiveLocation': 'Önce en az bir aktif lokasyon ekleyin.',
      'needCategory': 'En az bir kategori seçilmelidir.',
      'max16': 'En fazla 16 karakter olabilir.',
      'confirmDeleteCategory': '"{name}" kategorisini sil?',
      'confirmDeleteLocation': '"{name}" lokasyonunu sil?',
      'renameCategory': 'Kategoriyi Yeniden Adlandır',
      'renameLocation': 'Lokasyonu Yeniden Adlandır',
      'renameSuccess': 'Lokasyon adı "{name}" olarak güncellendi.',
      'deleteSuccess': '"{name}" lokasyonu silindi.',
      'addedCategory': '"{name}" kategorisi eklendi.',
      'addedLocation': '"{name}" lokasyonu eklendi.',
      'addedLocationTo': '"{loc}" lokasyonu "{cat}" kategorisine eklendi.',
      'deletedCategory': '"{name}" kategorisi silindi.',
      'categoryRenamed': 'Kategori adı "{name}" olarak değiştirildi.',
      'editHint':
          'Özel lokasyonları yeniden adlandırmak için basılı tut, silmek için çift dokun.',
      'onlineUnavailable': 'Çevrimiçi mod çok yakında',
      'codeNameRequired': 'Tüm oyuncuların bir kod adı olmalı.',
      'maxNameLength': 'İsimler en fazla 16 karakter olabilir.',
      'lettersOnly': 'İsimler sadece harf ve boşluk içerebilir.',
      'nameNotAllowed': '"{name}" yasak.',
      'noDuplicates': 'Aynı isimden iki tane olamaz.',
      'namesSaved': 'Ajan isimleri kaydedildi.',
      'locationsSaved': 'Lokasyonlar kaydedildi.',
      'selectCategory': 'En az bir lokasyon kategorisi seçin.',
      'noLocationsSelected': 'Seçili kategorilerde lokasyon yok.',
    },
  };

  static const _categoryTranslations = {
    'en': {
      'Standard': 'Standard',
      'Vacation': 'Vacation',
      'Workplace': 'Workplace',
    },
    'tr': {
      'Standard': 'Standart',
      'Vacation': 'Tatil',
      'Workplace': 'İşyeri',
    },
  };

  static const _locationTranslations = {
    'en': {
      'Hospital': 'Hospital',
      'School': 'School',
      'Police Station': 'Police Station',
      'Supermarket': 'Supermarket',
      'Cinema': 'Cinema',
      'Restaurant': 'Restaurant',
      'Hotel': 'Hotel',
      'Bank': 'Bank',
      'Airplane': 'Airplane',
      'Library': 'Library',
      'Beach': 'Beach',
      'Ski Resort': 'Ski Resort',
      'Cruise Ship': 'Cruise Ship',
      'Camping Site': 'Camping Site',
      'Theme Park': 'Theme Park',
      'Museum': 'Museum',
      'Spa': 'Spa',
      'Casino': 'Casino',
      'Zoo': 'Zoo',
      'National Park': 'National Park',
      'Office': 'Office',
      'Construction Site': 'Construction Site',
      'Studio': 'Studio',
      'Laboratory': 'Laboratory',
      'Factory': 'Factory',
      'Farm': 'Farm',
      'Space Station': 'Space Station',
      'Submarine': 'Submarine',
      'Fire Station': 'Fire Station',
      'News Room': 'News Room',
    },
    'tr': {
      'Hospital': 'Hastane',
      'School': 'Okul',
      'Police Station': 'Polis Karakolu',
      'Supermarket': 'Süpermarket',
      'Cinema': 'Sinema',
      'Restaurant': 'Restoran',
      'Hotel': 'Otel',
      'Bank': 'Banka',
      'Airplane': 'Uçak',
      'Library': 'Kütüphane',
      'Beach': 'Plaj',
      'Ski Resort': 'Kayak Merkezi',
      'Cruise Ship': 'Kruvaziyer Gemisi',
      'Camping Site': 'Kamp Alanı',
      'Theme Park': 'Tema Parkı',
      'Museum': 'Müze',
      'Spa': 'Spa',
      'Casino': 'Kumarhane',
      'Zoo': 'Hayvanat Bahçesi',
      'National Park': 'Milli Park',
      'Office': 'Ofis',
      'Construction Site': 'İnşaat Sahası',
      'Studio': 'Stüdyo',
      'Laboratory': 'Laboratuvar',
      'Factory': 'Fabrika',
      'Farm': 'Çiftlik',
      'Space Station': 'Uzay İstasyonu',
      'Submarine': 'Denizaltı',
      'Fire Station': 'İtfaiye',
      'News Room': 'Haber Odası',
    },
  };

  String _translate(String key) {
    final langCode =
        supported.contains(locale.languageCode) ? locale.languageCode : 'en';
    return _strings[langCode]?[key] ?? _strings['en']![key]!;
  }

  String text(String key) => _translate(key);

  String agentRevealCounter(int current, int total) => language == Language.tr
      ? 'Ajan $current / $total'
      : 'Agent $current / $total';

  String categoryName(String name) {
    final langCode =
        supported.contains(locale.languageCode) ? locale.languageCode : 'en';
    return _categoryTranslations[langCode]?[name] ?? name;
  }

  String locationName(String name) {
    final langCode =
        supported.contains(locale.languageCode) ? locale.languageCode : 'en';
    return _locationTranslations[langCode]?[name] ?? name;
  }

  String timerLength(int minutes) =>
      _translate('timerLength').replaceAll('{minutes}', minutes.toString());

  String activeCount(int active, int total) => _translate('activeCount')
      .replaceAll('{active}', active.toString())
      .replaceAll('{total}', total.toString());

  String secretLocationReveal(String location) =>
      _translate('secretLocationReveal')
          .replaceAll('{location}', locationName(location));

  String nameNotAllowed(String name) =>
      _translate('nameNotAllowed').replaceAll('{name}', name);

  String addLocationTo(String category) => _translate('addLocationTo')
      .replaceAll('{category}', categoryName(category));

  String agentHint(int index) =>
      language == Language.tr ? 'Ajan ${index + 1}' : 'Agent ${index + 1}';

  static SpyLocalizations of(BuildContext context) =>
      Localizations.of(context, SpyLocalizations)!;

  static SpyLocalizations forLanguage(Language language) =>
      SpyLocalizations(Locale(language == Language.tr ? 'tr' : 'en'));
}

class SpyLocalizationsDelegate extends LocalizationsDelegate<SpyLocalizations> {
  const SpyLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) =>
      SpyLocalizations.supported.contains(locale.languageCode);

  @override
  Future<SpyLocalizations> load(Locale locale) async =>
      SynchronousFuture(SpyLocalizations(locale));

  @override
  bool shouldReload(covariant LocalizationsDelegate<SpyLocalizations> old) =>
      false;
}

extension SpyLocalizationX on BuildContext {
  SpyLocalizations get l10n => SpyLocalizations.of(this);
}
