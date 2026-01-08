import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';
import 'roster_screen.dart';

class OfflineSetupScreen extends StatefulWidget {
  const OfflineSetupScreen({super.key});

  @override
  State<OfflineSetupScreen> createState() => _OfflineSetupScreenState();
}

class _OfflineSetupScreenState extends State<OfflineSetupScreen> {
  final List<TextEditingController> _controllers = [];

  @override
  void initState() {
    super.initState();
    final controller = context.read<GameController>();
    final existing = controller.state.players.isNotEmpty
        ? controller.state.players.map((p) => p.name).toList()
        : controller.savedNames.isNotEmpty
            ? controller.savedNames
            : List<String>.generate(controller.state.settings.playerCount,
                (i) => 'Player ${i + 1}');
    for (final name in existing) {
      _controllers.add(TextEditingController(text: name));
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _syncControllerLength(int desired) {
    if (desired > _controllers.length) {
      for (var i = _controllers.length; i < desired; i++) {
        _controllers.add(TextEditingController(text: 'Player ${i + 1}'));
      }
    } else if (desired < _controllers.length) {
      final removeCount = _controllers.length - desired;
      _controllers.removeRange(
          _controllers.length - removeCount, _controllers.length);
    }
  }

  void _changePlayerCount(GameController controller, int next) {
    controller.updateSettings(playerCount: next);
    setState(() {
      _syncControllerLength(next);
    });
  }

  void _changeSpyCount(GameController controller, int next) {
    controller.updateSettings(spyCount: next);
    setState(() {});
  }

  void _changeTimer(GameController controller, int minutes) {
    controller.updateSettings(timerDuration: minutes);
    setState(() {});
  }

  void _startGame(GameController controller) {
    final names = _controllers.map((c) => c.text.trim()).toList();

    for (final name in names) {
      if (name.isEmpty) {
        _showMessage('All players need a codename.');
        return;
      }
      if (name.length > 16) {
        _showMessage('Names must be 16 characters or fewer.');
        return;
      }
      if (!RegExp(r'^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$').hasMatch(name)) {
        _showMessage('Names can only contain letters and spaces.');
        return;
      }
      if (containsProfanity(name)) {
        _showMessage('"$name" is not allowed.');
        return;
      }
    }
    if (names.toSet().length != names.length) {
      _showMessage('Duplicate names are not allowed.');
      return;
    }

    final error = controller.startOfflineGame(names);
    if (error != null) {
      _showMessage(error);
      return;
    }

    Navigator.of(context).pushReplacementNamed('/game');
  }

  void _showMessage(String text) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(text)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, _) {
        final settings = controller.state.settings;
        _syncControllerLength(settings.playerCount);

        return SpyScaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: const Text('Mission Setup'),
          ),
          bottom: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 18),
            child: ElevatedButton.icon(
              onPressed: () => _startGame(controller),
              icon: const Icon(Icons.play_arrow_rounded),
              label: const Text('Start Mission'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(56),
                textStyle: const TextStyle(fontSize: 18),
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              _CounterTile(
                label: 'Agents',
                value: settings.playerCount,
                min: 4,
                max: 8,
                onChanged: (val) => _changePlayerCount(controller, val),
                helper:
                    'In normal circumstances, at least 4 agents are required. You can have up to 8 agents in a mission.',
              ),
              const SizedBox(height: 12),
              _CounterTile(
                label: 'Spies',
                value: settings.playerCount <= 5 ? 1 : settings.spyCount,
                min: 1,
                max: settings.playerCount > 5 ? 2 : 1,
                locked: settings.playerCount <= 5,
                onChanged: (val) => _changeSpyCount(controller, val),
                helper: settings.playerCount <= 5
                    ? 'Only one spy can exist when there are less than 5 agents in the field.'
                    : 'If there are more than 5 agents, you can have up to 2 spies in the mission.',
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Mission Timer',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Switch(
                            value: settings.isTimerOn,
                            onChanged: (val) =>
                                controller.updateSettings(isTimerOn: val),
                          ),
                        ],
                      ),
                      if (settings.isTimerOn) ...[
                        const SizedBox(height: 12),
                        Slider(
                          value: settings.timerDuration.toDouble(),
                          min: 5,
                          max: 30,
                          divisions: 25,
                          label: '${settings.timerDuration} min',
                          onChanged: (val) =>
                              _changeTimer(controller, val.round()),
                        ),
                        Text(
                          'Timer length: ${settings.timerDuration} minutes',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.white70),
                        ),
                      ] else
                        Text(
                          'No timer active. Take your time.',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.white70),
                        ),
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        onPressed: () =>
                            Navigator.of(context).pushNamed('/locations'),
                        icon: const Icon(Icons.map_outlined),
                        label: const Text('Manage Locations'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () async {
                  final result = await Navigator.of(context).push<List<String>>(
                    MaterialPageRoute(
                      builder: (_) => AgentRosterScreen(
                          initialNames:
                              _controllers.map((c) => c.text).toList()),
                    ),
                  );
                  if (result != null) {
                    setState(() {
                      _controllers.clear();
                      for (final name in result) {
                        _controllers.add(TextEditingController(text: name));
                      }
                    });
                  }
                },
                icon: const Icon(Icons.manage_accounts),
                label: const Text('Manage Agent Roster'),
              ),
              const SizedBox(height: 80),
            ],
          ),
        );
      },
    );
  }
}

class _CounterTile extends StatelessWidget {
  const _CounterTile({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    this.helper,
    this.locked = false,
  });

  final String label;
  final int value;
  final int min;
  final int max;
  final bool locked;
  final void Function(int) onChanged;
  final String? helper;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    IconButton(
                      onPressed: (!locked && value > min)
                          ? () => onChanged(value - 1)
                          : null,
                      icon: const Icon(Icons.remove_circle_outline),
                    ),
                    Text('$value',
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 18)),
                    IconButton(
                      onPressed: (!locked && value < max)
                          ? () => onChanged(value + 1)
                          : null,
                      icon: const Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
              ],
            ),
            if (helper != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  helper!,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Colors.white70),
                ),
              ),
            if (locked)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  'Locked due to agents count.',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Colors.orangeAccent),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
