import 'package:flutter/material.dart';

import '../data/words.dart';

class PlayerRole {
  final String name;
  final bool isSpy;

  const PlayerRole({required this.name, required this.isSpy});
}

class GameRound {
  final WordPrompt prompt;
  final List<PlayerRole> roles;
  final Duration roundDuration;

  const GameRound({
    required this.prompt,
    required this.roles,
    required this.roundDuration,
  });

  int get spyCount => roles.where((role) => role.isSpy).length;

  List<PlayerRole> get civilians => roles.where((role) => !role.isSpy).toList();
}

@immutable
class GameConfiguration {
  final List<String> players;
  final int spyCount;
  final Duration roundDuration;

  const GameConfiguration({
    required this.players,
    required this.spyCount,
    required this.roundDuration,
  });

  GameConfiguration copyWith({
    List<String>? players,
    int? spyCount,
    Duration? roundDuration,
  }) {
    return GameConfiguration(
      players: players ?? this.players,
      spyCount: spyCount ?? this.spyCount,
      roundDuration: roundDuration ?? this.roundDuration,
    );
  }
}
