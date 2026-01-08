import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/game_models.dart';

class GameController extends ChangeNotifier {
  GameController() {
    _loadPreferences();
  }

  GameState _state = GameState.initial();
  Timer? _timer;
  SharedPreferences? _prefs;

  GameState get state => _state;

  Future<void> _loadPreferences() async {
    try {
      _prefs ??= await SharedPreferences.getInstance();
      final sound = _prefs!.getBool('sound');
      final vibrate = _prefs!.getBool('vibrate');
      final music = _prefs!.getBool('music');
      final highContrast = _prefs!.getBool('highContrast');

      _state = _state.copyWith(
        appSettings: _state.appSettings.copyWith(
          sound: sound ?? _state.appSettings.sound,
          vibrate: vibrate ?? _state.appSettings.vibrate,
          music: music ?? _state.appSettings.music,
          highContrast: highContrast ?? _state.appSettings.highContrast,
        ),
      );
      notifyListeners();
    } catch (_) {
      // Safe to ignore; defaults will be used.
    }
  }

  Future<void> toggleAppSetting(String key) async {
    final current = _state.appSettings;
    bool sound = current.sound;
    bool vibrate = current.vibrate;
    bool music = current.music;
    bool highContrast = current.highContrast;

    switch (key) {
      case 'sound':
        sound = !sound;
        break;
      case 'vibrate':
        vibrate = !vibrate;
        break;
      case 'music':
        music = !music;
        break;
      case 'highContrast':
        highContrast = !highContrast;
        break;
      default:
        return;
    }

    _state = _state.copyWith(
      appSettings: AppSettings(
        sound: sound,
        vibrate: vibrate,
        music: music,
        highContrast: highContrast,
      ),
    );
    notifyListeners();

    try {
      _prefs ??= await SharedPreferences.getInstance();
      await _prefs!.setBool('sound', sound);
      await _prefs!.setBool('vibrate', vibrate);
      await _prefs!.setBool('music', music);
      await _prefs!.setBool('highContrast', highContrast);
    } catch (_) {
      // Ignore persistence errors.
    }
  }

  void setMode(GameMode mode) {
    _state = _state.copyWith(mode: mode);
    notifyListeners();
  }

  void updateSettings({
    int? playerCount,
    int? spyCount,
    bool? isTimerOn,
    int? timerDuration,
  }) {
    var nextSettings = _state.settings;

    if (playerCount != null) {
      final adjustedSpy = playerCount <= 5 ? 1 : min(nextSettings.spyCount, 2);
      nextSettings = nextSettings.copyWith(
        playerCount: playerCount,
        spyCount: adjustedSpy,
      );
    }

    if (spyCount != null) {
      nextSettings = nextSettings.copyWith(spyCount: spyCount);
    }

    if (isTimerOn != null) {
      nextSettings = nextSettings.copyWith(isTimerOn: isTimerOn);
    }

    if (timerDuration != null) {
      nextSettings = nextSettings.copyWith(timerDuration: timerDuration);
    }

    _state = _state.copyWith(settings: nextSettings);
    notifyListeners();
  }

  void updatePlayerNames(List<String> names) {
    final updated = <Player>[];
    for (var i = 0; i < names.length; i++) {
      updated.add(
        Player(
          id: i < _state.players.length ? _state.players[i].id : generatePlayerId(i),
          name: names[i],
          role: Role.civilian,
          isDead: false,
          votes: 0,
        ),
      );
    }
    _state = _state.copyWith(players: updated);
    notifyListeners();
  }

  String? startOfflineGame(List<String> playerNames) {
    if (_state.settings.selectedCategories.isEmpty) {
      return 'Select at least one location category.';
    }

    final validCategories = _state.gameData.categories
        .where((c) => _state.settings.selectedCategories.contains(c.id) && c.locations.isNotEmpty)
        .toList();

    if (validCategories.isEmpty) {
      return 'Selected categories do not have any locations.';
    }

    final trimmed = playerNames.map((n) => n.trim()).toList();
    if (trimmed.any((name) => name.isEmpty)) {
      return 'All players need a codename.';
    }

    final random = Random();
    final chosenCategory = validCategories[random.nextInt(validCategories.length)];
    final location = chosenCategory.locations[random.nextInt(chosenCategory.locations.length)];

    final players = List<Player>.generate(trimmed.length, (index) {
      return Player(
        id: generatePlayerId(index),
        name: trimmed[index],
        role: Role.civilian,
        isDead: false,
        votes: 0,
      );
    });

    var spiesAssigned = 0;
    while (spiesAssigned < _state.settings.spyCount) {
      final idx = random.nextInt(players.length);
      if (players[idx].role != Role.spy) {
        players[idx] = players[idx].copyWith(role: Role.spy);
        spiesAssigned++;
      }
    }

    _stopTimer();

    _state = _state.copyWith(
      players: players,
      phase: GamePhase.reveal,
      gameData: _state.gameData.copyWith(
        currentLocation: location,
        currentRevealIndex: 0,
        timeLeft: _state.settings.timerDuration * 60,
        winner: null,
      ),
    );
    notifyListeners();
    return null;
  }

  void nextReveal() {
    _state = _state.copyWith(
      gameData: _state.gameData.copyWith(
        currentRevealIndex: _state.gameData.currentRevealIndex + 1,
      ),
    );
    notifyListeners();
  }

  void startPlaying() {
    _state = _state.copyWith(phase: GamePhase.playing);
    _startTimerIfNeeded();
    notifyListeners();
  }

  void startVoting() {
    _stopTimer();
    final resetVotes = _state.players.map((p) => p.copyWith(votes: 0)).toList();
    _state = _state.copyWith(phase: GamePhase.voting, players: resetVotes);
    notifyListeners();
  }

  void eliminatePlayer(String playerId) {
    final eliminated = _state.players.firstWhere((p) => p.id == playerId);
    final updatedPlayers = _state.players
        .map((p) => p.id == playerId ? p.copyWith(isDead: true) : p)
        .toList();

    final remaining = updatedPlayers.where((p) => !p.isDead).toList();
    final totalSpiesAtStart = _state.players.where((p) => p.role == Role.spy).length;
    final spiesLeft = remaining.where((p) => p.role == Role.spy).length;
    final civiliansLeft = remaining.where((p) => p.role == Role.civilian).length;

    var nextPhase = _state.phase;
    Role? winner = _state.gameData.winner;

    if (eliminated.role == Role.spy) {
      if (spiesLeft == 0) {
        nextPhase = GamePhase.result;
        winner = Role.civilian;
      } else {
        nextPhase = GamePhase.playing;
      }
    } else {
      if (totalSpiesAtStart > 1) {
        if (spiesLeft > 1) {
          nextPhase = GamePhase.playing;
        } else {
          nextPhase = GamePhase.result;
          winner = Role.spy;
        }
      } else {
        nextPhase = GamePhase.result;
        winner = Role.spy;
      }
    }

    if (spiesLeft >= civiliansLeft) {
      nextPhase = GamePhase.result;
      winner = Role.spy;
    }

    if (winner != null) {
      _stopTimer();
    }

    _state = _state.copyWith(
      players: updatedPlayers,
      phase: nextPhase,
      gameData: _state.gameData.copyWith(winner: winner),
    );
    notifyListeners();
  }

  void resetGame() {
    _stopTimer();
    _state = GameState.initial().copyWith(
      mode: _state.mode,
      appSettings: _state.appSettings,
      gameData: _state.gameData.copyWith(categories: _state.gameData.categories),
    );
    notifyListeners();
  }

  void _startTimerIfNeeded() {
    if (!_state.settings.isTimerOn) return;
    _stopTimer();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_state.gameData.timeLeft <= 0) {
        timer.cancel();
        _state = _state.copyWith(
          phase: GamePhase.result,
          gameData: _state.gameData.copyWith(winner: Role.spy),
        );
        notifyListeners();
        return;
      }
      _state = _state.copyWith(
        gameData: _state.gameData.copyWith(timeLeft: _state.gameData.timeLeft - 1),
      );
      notifyListeners();
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
  }

  void toggleCategory(String id) {
    final selected = List<String>.from(_state.settings.selectedCategories);
    if (selected.contains(id)) {
      if (selected.length == 1) return;
      selected.remove(id);
    } else {
      selected.add(id);
    }

    _state = _state.copyWith(
      settings: _state.settings.copyWith(selectedCategories: selected),
    );
    notifyListeners();
  }

  void addCategory(String name) {
    final id = name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-');
    final existing = _state.gameData.categories.any((c) => c.id == id);
    if (existing || id.isEmpty) return;

    final updated = List<Category>.from(_state.gameData.categories)
      ..add(Category(id: id, name: name, icon: 'Folder', locations: const []));

    _state = _state.copyWith(
      gameData: _state.gameData.copyWith(categories: updated),
      settings: _state.settings.copyWith(selectedCategories: [..._state.settings.selectedCategories, id]),
    );
    notifyListeners();
  }

  void deleteCategory(String id) {
    if (_state.gameData.categories.length <= 1) return;
    final updatedCats = _state.gameData.categories.where((c) => c.id != id).toList();
    final updatedSelected = _state.settings.selectedCategories.where((c) => c != id).toList();

    if (updatedSelected.isEmpty && updatedCats.isNotEmpty) {
      updatedSelected.add(updatedCats.first.id);
    }

    _state = _state.copyWith(
      gameData: _state.gameData.copyWith(categories: updatedCats),
      settings: _state.settings.copyWith(selectedCategories: updatedSelected),
    );
    notifyListeners();
  }

  void addLocation(String categoryId, String location) {
    final trimmed = location.trim();
    if (trimmed.isEmpty) return;
    final updated = _state.gameData.categories.map((cat) {
      if (cat.id != categoryId) return cat;
      if (cat.locations.contains(trimmed)) return cat;
      final newLocs = List<String>.from(cat.locations)..add(trimmed);
      return cat.copyWith(locations: newLocs);
    }).toList();

    _state = _state.copyWith(
      gameData: _state.gameData.copyWith(categories: updated),
    );
    notifyListeners();
  }

  void removeLocation(String categoryId, String location) {
    final updated = _state.gameData.categories.map((cat) {
      if (cat.id != categoryId) return cat;
      final newLocs = List<String>.from(cat.locations)..remove(location);
      return cat.copyWith(locations: newLocs);
    }).toList();

    _state = _state.copyWith(
      gameData: _state.gameData.copyWith(categories: updated),
    );
    notifyListeners();
  }
}
