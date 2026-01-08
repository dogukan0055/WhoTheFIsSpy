import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../models/game_models.dart';

class SpyLocalizations {
  SpyLocalizations(this.locale)
      : language =
            locale.languageCode.toLowerCase() == 'tr' ? Language.tr : Language.en;

  final Locale locale;
  final Language language;

  static const supported = ['en', 'tr'];

  static const _strings = {
    'en': {
      'welcomeTitle': 'Welcome, Agent',
      'welcomeBody': 'A spy hides among you. Keep your answers vague, but sharp.',
      'secretTitle': 'Reveal in Secret',
      'secretBody': 'Pass the device and scan to reveal your identity. No peeking.',
      'interrogateTitle': 'Interrogate & Vote',
      'interrogateBody': 'Ask pointed questions, call a vote, and catch the impostor.',
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
      'missionTimer': 'Mission Timer',
      'noTimer': 'No timer active. Take your time.',
      'timerLength': 'Timer length: {minutes} minutes',
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
      'objectiveCivilian': '• Civilians: Find the spy without revealing the location.',
      'objectiveSpy': '• Spy: Blend in. Identify the location before being caught.',
      'gameplay': 'Gameplay',
      'gameplayStep1': '1) Pass the phone, reveal your role.',
      'gameplayStep2': '2) Start the timer and ask sharp questions.',
      'gameplayStep3': '3) Call a vote when someone feels suspicious.',
      'winConditions': 'Win Conditions',
      'spyWins': '• Spy wins if a civilian is eliminated or time expires.',
      'civiliansWin': '• Civilians win if all spies are caught.',
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
      'civilian': 'Civilian',
      'secretLocation': 'Secret Location',
      'blendIn': 'Blend in. Listen closely and guess the location.',
      'noTimerShort': 'No timer',
      'agentsActive': 'Agents Active',
      'spiesRemaining': 'Spies Remaining',
      'callVote': 'Call Vote',
      'mainMenu': 'Main Menu',
      'leaveMission': 'Leave Mission?',
      'returnToMenu': 'Are you sure you want to return to the main menu?',
      'stay': 'Stay',
      'emergencyMeeting': 'Emergency meeting',
      'cancel': 'Cancel',
      'eliminate': 'Eliminate',
      'spiesWin': 'Spies win',
      'civiliansWinResult': 'Civilians win',
      'secretLocationReveal': 'Secret location: {location}',
      'spiesHeader': 'Spies',
      'caught': 'Caught',
      'playAgain': 'Play again',
      'agentRoster': 'Agent Roster',
      'save': 'Save',
      'saveRoster': 'Save Roster',
      'timerOff': 'No timer',
      'locationDb': 'Location Database',
      'addCategory': 'Add category',
      'newCategory': 'New Category',
      'categoryHint': 'Ex: Cafes',
      'addLocation': 'Add location',
      'addLocationTo': 'Add location to {category}',
      'locationHint': 'Ex: Submarine base',
      'activeCount': 'Active {active} / {total}',
      'needActiveLocation': 'Add at least one active location first.',
      'needCategory': 'At least one category is required.',
      'onlineUnavailable': 'Online mode coming soon',
      'codeNameRequired': 'All players need a codename.',
      'maxNameLength': 'Names must be 16 characters or fewer.',
      'lettersOnly': 'Names can only contain letters and spaces.',
      'nameNotAllowed': '"{name}" is not allowed.',
      'noDuplicates': 'Duplicate names are not allowed.',
      'selectCategory': 'Select at least one location category.',
      'noLocationsSelected': 'Selected categories do not have any locations.',
    },
    'tr': {
      'welcomeTitle': 'Hoş geldin Ajan',
      'welcomeBody': 'İçinizde bir casus var. Cevapların net olsun ama gizli kal.',
      'secretTitle': 'Gizlice Açığa Çık',
      'secretBody': 'Cihazı sırayla ver ve kimliğini tarayarak öğren. Sakın bakma.',
      'interrogateTitle': 'Sorgula ve Oyla',
      'interrogateBody': 'Keskin sorular sor, oylama çağır ve sahtekârı yakala.',
      'skip': 'Geç',
      'next': 'İleri',
      'enterMission': 'Göreve Gir',
      'missionSetup': 'Görev Hazırlığı',
      'startMission': 'Görevi Başlat',
      'agents': 'Ajanlar',
      'agentsHelper':
          'Normalde en az 4 ajana ihtiyaç var. Bir görevde en fazla 8 ajan olabilir.',
      'spies': 'Casuslar',
      'spiesHelperLocked':
          '5 ajandan az olduğunda yalnızca bir casus olabilir.',
      'spiesHelper':
          '5 ajandan fazlaysa görevde en fazla 2 casus olabilir.',
      'missionTimer': 'Görev Zamanlayıcısı',
      'noTimer': 'Zamanlayıcı yok. Acele etme.',
      'timerLength': 'Zamanlayıcı süresi: {minutes} dakika',
      'manageLocations': 'Lokasyonları Yönet',
      'manageRoster': 'Ajan Listesini Yönet',
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
      'objectiveCivilian':
          '• Siviller: Lokasyonu belli etmeden casusu bul.',
      'objectiveSpy': '• Casus: Fark edilme. Lokasyonu öğren ve hayatta kal.',
      'gameplay': 'Oynanış',
      'gameplayStep1': '1) Telefonu sırayla ver, rolünü aç.',
      'gameplayStep2': '2) Zamanlayıcıyı başlat ve keskin sorular sor.',
      'gameplayStep3': '3) Şüphelenince oylama başlat.',
      'winConditions': 'Kazanma Şartları',
      'spyWins': '• Casus, bir sivil elenirse veya süre biterse kazanır.',
      'civiliansWin': '• Tüm casuslar yakalanırsa siviller kazanır.',
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
      'civilian': 'Sivil',
      'secretLocation': 'Gizli Lokasyon',
      'blendIn': 'Uyum sağla. Dikkatlice dinle ve lokasyonu tahmin et.',
      'noTimerShort': 'Zamanlayıcı yok',
      'agentsActive': 'Aktif Ajan',
      'spiesRemaining': 'Kalan Casus',
      'callVote': 'Oylama Çağır',
      'mainMenu': 'Ana Menü',
      'leaveMission': 'Görevden Çıkılsın mı?',
      'returnToMenu': 'Ana menüye dönmek istediğine emin misin?',
      'stay': 'Kal',
      'emergencyMeeting': 'Acil toplantı',
      'cancel': 'Vazgeç',
      'eliminate': 'Ele',
      'spiesWin': 'Casuslar kazandı',
      'civiliansWinResult': 'Siviller kazandı',
      'secretLocationReveal': 'Gizli lokasyon: {location}',
      'spiesHeader': 'Casuslar',
      'caught': 'Yakalandı',
      'playAgain': 'Tekrar oyna',
      'agentRoster': 'Ajan Listesi',
      'save': 'Kaydet',
      'saveRoster': 'Listeyi Kaydet',
      'timerOff': 'Zamanlayıcı yok',
      'locationDb': 'Lokasyon Veritabanı',
      'addCategory': 'Kategori ekle',
      'newCategory': 'Yeni Kategori',
      'categoryHint': 'Örn: Kafeler',
      'addLocation': 'Lokasyon ekle',
      'addLocationTo': '{category} kategorisine lokasyon ekle',
      'locationHint': 'Örn: Denizaltı üssü',
      'activeCount': 'Aktif {active} / {total}',
      'needActiveLocation': 'Önce en az bir aktif lokasyon ekleyin.',
      'needCategory': 'En az bir kategori seçilmelidir.',
      'onlineUnavailable': 'Çevrimiçi mod çok yakında',
      'codeNameRequired': 'Tüm oyuncuların bir kod adı olmalı.',
      'maxNameLength': 'İsimler en fazla 16 karakter olabilir.',
      'lettersOnly': 'İsimler sadece harf ve boşluk içerebilir.',
      'nameNotAllowed': '"{name}" yasak.',
      'noDuplicates': 'Aynı isimden iki tane olamaz.',
      'selectCategory': 'En az bir lokasyon kategorisi seçin.',
      'noLocationsSelected': 'Seçili kategorilerde lokasyon yok.',
    },
  };

  String _translate(String key) {
    final langCode = supported.contains(locale.languageCode)
        ? locale.languageCode
        : 'en';
    return _strings[langCode]?[key] ?? _strings['en']![key]!;
  }

  String text(String key) => _translate(key);

  String agentRevealCounter(int current, int total) => language == Language.tr
      ? 'Ajan $current / $total'
      : 'Agent $current / $total';

  String timerLength(int minutes) => _translate('timerLength')
      .replaceAll('{minutes}', minutes.toString());

  String activeCount(int active, int total) => _translate('activeCount')
      .replaceAll('{active}', active.toString())
      .replaceAll('{total}', total.toString());

  String secretLocationReveal(String location) =>
      _translate('secretLocationReveal').replaceAll('{location}', location);

  String nameNotAllowed(String name) =>
      _translate('nameNotAllowed').replaceAll('{name}', name);

  String addLocationTo(String category) =>
      _translate('addLocationTo').replaceAll('{category}', category);

  String agentHint(int index) =>
      language == Language.tr ? 'Ajan ${index + 1}' : 'Agent ${index + 1}';

  static SpyLocalizations of(BuildContext context) =>
      Localizations.of(context, SpyLocalizations)!;

  static SpyLocalizations forLanguage(Language language) =>
      SpyLocalizations(Locale(language == Language.tr ? 'tr' : 'en'));
}

class SpyLocalizationsDelegate
    extends LocalizationsDelegate<SpyLocalizations> {
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
