import 'dart:math';

import 'package:flutter/material.dart';

import '../data/words.dart';
import '../models/game_models.dart';
import 'game_page.dart';

class OfflineSetupPage extends StatefulWidget {
  const OfflineSetupPage({
    super.key,
    required this.initialConfiguration,
  });

  final GameConfiguration initialConfiguration;

  @override
  State<OfflineSetupPage> createState() => _OfflineSetupPageState();
}

class _OfflineSetupPageState extends State<OfflineSetupPage> {
  late GameConfiguration _configuration;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _configuration = widget.initialConfiguration;
  }

  void _updatePlayer(int index, String value) {
    final updated = List<String>.from(_configuration.players);
    updated[index] = value;
    setState(() {
      _configuration = _configuration.copyWith(players: updated);
    });
  }

  void _addPlayer() {
    setState(() {
      _configuration = _configuration.copyWith(
        players: [
          ..._configuration.players,
          'Player ${_configuration.players.length + 1}'
        ],
      );
    });
  }

  void _removePlayer(int index) {
    final updated = List<String>.from(_configuration.players)..removeAt(index);
    setState(() {
      _configuration = _configuration.copyWith(players: updated);
    });
  }

  void _startRound() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final roles = <PlayerRole>[];
    final random = Random();
    final shuffledPlayers = List<String>.from(_configuration.players)
      ..shuffle(random);
    final prompt = const WordBank().draw(random);
    final spyCount = _configuration.spyCount
        .clamp(1, (_configuration.players.length / 2).floor());

    final spies = shuffledPlayers.take(spyCount).toSet();
    for (final player in shuffledPlayers) {
      roles.add(PlayerRole(name: player, isSpy: spies.contains(player)));
    }

    final round = GameRound(
      prompt: prompt,
      roles: roles,
      roundDuration: _configuration.roundDuration,
    );

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => GamePage(round: round),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const minSpyCount = 1;
    final maxSpyCount = (_configuration.players.length / 2).floor();
    final sliderMax = maxSpyCount.clamp(minSpyCount, 5).toDouble();
    final sliderDivisions = (maxSpyCount - minSpyCount).clamp(1, 5).toInt();
    final spyCount = _configuration.spyCount.clamp(minSpyCount, maxSpyCount);

    return Scaffold(
      appBar: AppBar(title: const Text('Offline setup')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 640),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Build your lobby',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                      'Add at least four players to keep deduction interesting.'),
                  const SizedBox(height: 24),
                  ..._configuration.players.asMap().entries.map((entry) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              initialValue: entry.value,
                              decoration: InputDecoration(
                                labelText: 'Player ${entry.key + 1}',
                                filled: true,
                                fillColor: Colors.white,
                              ),
                              onChanged: (value) =>
                                  _updatePlayer(entry.key, value),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Enter a name';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            onPressed: _configuration.players.length > 4
                                ? () => _removePlayer(entry.key)
                                : null,
                            icon: const Icon(Icons.delete_outline),
                          ),
                        ],
                      ),
                    );
                  }),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: OutlinedButton.icon(
                      onPressed: _addPlayer,
                      icon: const Icon(Icons.person_add_alt_1),
                      label: const Text('Add player'),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Spies ($spyCount)'),
                            Slider(
                              value: spyCount.toDouble(),
                              min: minSpyCount.toDouble(),
                              max: sliderMax,
                              divisions: sliderDivisions,
                              label: spyCount.toString(),
                              onChanged: (value) {
                                setState(() {
                                  _configuration = _configuration.copyWith(
                                      spyCount: value.floor());
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                                'Round timer: ${_configuration.roundDuration.inMinutes} min'),
                            Slider(
                              value: _configuration.roundDuration.inMinutes
                                  .toDouble(),
                              min: 5,
                              max: 12,
                              divisions: 7,
                              onChanged: (value) {
                                setState(() {
                                  _configuration = _configuration.copyWith(
                                    roundDuration:
                                        Duration(minutes: value.round()),
                                  );
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  FilledButton.icon(
                    onPressed:
                        _configuration.players.length >= 4 ? _startRound : null,
                    icon: const Icon(Icons.play_arrow_rounded),
                    label: const Text('Start round'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
