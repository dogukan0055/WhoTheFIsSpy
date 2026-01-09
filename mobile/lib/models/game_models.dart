import 'dart:math';
import 'package:flutter/material.dart';

enum GameMode { offline, online }

enum Role { spy, agent }

enum GamePhase { setup, reveal, playing, voting, result }

enum Language { en, tr }

class Player {
  Player({
    required this.id,
    required this.name,
    required this.role,
    required this.isDead,
    required this.votes,
  });

  final String id;
  final String name;
  final Role role;
  final bool isDead;
  final int votes;

  Player copyWith({
    String? id,
    String? name,
    Role? role,
    bool? isDead,
    int? votes,
  }) {
    return Player(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      isDead: isDead ?? this.isDead,
      votes: votes ?? this.votes,
    );
  }
}

class AppSettings {
  const AppSettings({
    required this.sound,
    required this.vibrate,
    required this.music,
    required this.highContrast,
  });

  final bool sound;
  final bool vibrate;
  final bool music;
  final bool highContrast;

  AppSettings copyWith({
    bool? sound,
    bool? vibrate,
    bool? music,
    bool? highContrast,
  }) {
    return AppSettings(
      sound: sound ?? this.sound,
      vibrate: vibrate ?? this.vibrate,
      music: music ?? this.music,
      highContrast: highContrast ?? this.highContrast,
    );
  }
}

class GameSettings {
  GameSettings({
    required this.playerCount,
    required this.spyCount,
    required this.isTimerOn,
    required this.timerDuration,
    required this.selectedCategories,
  });

  final int playerCount;
  final int spyCount;
  final bool isTimerOn;
  final int timerDuration;
  final List<String> selectedCategories;

  GameSettings copyWith({
    int? playerCount,
    int? spyCount,
    bool? isTimerOn,
    int? timerDuration,
    List<String>? selectedCategories,
  }) {
    return GameSettings(
      playerCount: playerCount ?? this.playerCount,
      spyCount: spyCount ?? this.spyCount,
      isTimerOn: isTimerOn ?? this.isTimerOn,
      timerDuration: timerDuration ?? this.timerDuration,
      selectedCategories:
          selectedCategories ?? List.from(this.selectedCategories),
    );
  }
}

class Category {
  const Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.locations,
    this.disabledLocations = const [],
  });

  final String id;
  final String name;
  final String icon;
  final List<String> locations;
  final List<String> disabledLocations;

  Category copyWith({
    String? id,
    String? name,
    String? icon,
    List<String>? locations,
    List<String>? disabledLocations,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      locations: locations ?? List.from(this.locations),
      disabledLocations: disabledLocations ?? List.from(this.disabledLocations),
    );
  }
}

class GameData {
  const GameData({
    required this.currentLocation,
    required this.currentRevealIndex,
    required this.timeLeft,
    required this.winner,
    required this.categories,
  });

  final String currentLocation;
  final int currentRevealIndex;
  final int timeLeft;
  final Role? winner;
  final List<Category> categories;

  GameData copyWith({
    String? currentLocation,
    int? currentRevealIndex,
    int? timeLeft,
    Role? winner,
    List<Category>? categories,
  }) {
    return GameData(
      currentLocation: currentLocation ?? this.currentLocation,
      currentRevealIndex: currentRevealIndex ?? this.currentRevealIndex,
      timeLeft: timeLeft ?? this.timeLeft,
      winner: winner ?? this.winner,
      categories: categories ?? _cloneCategories(categories ?? this.categories),
    );
  }
}

class GameState {
  GameState({
    required this.mode,
    required this.players,
    required this.appSettings,
    required this.settings,
    required this.gameData,
    required this.phase,
    required this.themeMode,
    required this.language,
    required this.isPaused,
    required this.spiesCaughtSignal,
    this.lastCaughtSpy,
  });

  final GameMode? mode;
  final List<Player> players;
  final AppSettings appSettings;
  final GameSettings settings;
  final GameData gameData;
  final GamePhase phase;
  final ThemeMode themeMode;
  final Language language;
  final bool isPaused;
  final int spiesCaughtSignal;
  final String? lastCaughtSpy;

  factory GameState.initial() {
    return GameState(
      mode: null,
      players: const [],
      appSettings: const AppSettings(
        sound: true,
        vibrate: true,
        music: true,
        highContrast: false,
      ),
      settings: GameSettings(
        playerCount: 4,
        spyCount: 1,
        isTimerOn: true,
        timerDuration: 5,
        selectedCategories: initialCategories.map((c) => c.id).toList(),
      ),
      gameData: GameData(
        currentLocation: '',
        currentRevealIndex: 0,
        timeLeft: 300,
        winner: null,
        categories: _cloneCategories(initialCategories),
      ),
      phase: GamePhase.setup,
      themeMode: ThemeMode.dark,
      language: Language.en,
      isPaused: false,
      spiesCaughtSignal: 0,
      lastCaughtSpy: null,
    );
  }

  GameState copyWith({
    GameMode? mode,
    List<Player>? players,
    AppSettings? appSettings,
    GameSettings? settings,
    GameData? gameData,
    GamePhase? phase,
    ThemeMode? themeMode,
    Language? language,
    bool? isPaused,
    int? spiesCaughtSignal,
    String? lastCaughtSpy,
  }) {
    return GameState(
      mode: mode ?? this.mode,
      players: players ?? List.from(this.players),
      appSettings: appSettings ?? this.appSettings,
      settings: settings ?? this.settings,
      gameData: gameData ?? this.gameData,
      phase: phase ?? this.phase,
      themeMode: themeMode ?? this.themeMode,
      language: language ?? this.language,
      isPaused: isPaused ?? this.isPaused,
      spiesCaughtSignal: spiesCaughtSignal ?? this.spiesCaughtSignal,
      lastCaughtSpy: lastCaughtSpy ?? this.lastCaughtSpy,
    );
  }
}

List<Category> _cloneCategories(List<Category> categories) {
  return categories
      .map(
        (c) => c.copyWith(
          locations: List.from(c.locations),
          disabledLocations: List.from(c.disabledLocations),
        ),
      )
      .toList();
}

const initialCategories = <Category>[
  Category(
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
      'Library',
    ],
  ),
  Category(
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
      'National Park',
    ],
  ),
  Category(
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
      'News Room',
    ],
  ),
];

const bannedWords = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'cunt',
  'dick',
  'pussy',
  'cock',
  'whore',
  'slut',
  'bastard',
  'damn',
  'crap',
  'piss',
  'nigger',
  'faggot',
  'retard',
  'kill',
  'die',
  'suicide',
];

bool containsProfanity(String text) {
  final lower = text.toLowerCase();
  return bannedWords.any(lower.contains);
}

String generatePlayerId(int index) {
  final rand = Random();
  return 'p-$index-${rand.nextInt(99999)}';
}
