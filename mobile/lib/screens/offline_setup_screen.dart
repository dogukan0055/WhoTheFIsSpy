import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/notifier.dart';
import '../widgets/spy_scaffold.dart';
import 'roster_screen.dart';

class OfflineSetupScreen extends StatefulWidget {
  const OfflineSetupScreen({super.key});

  @override
  State<OfflineSetupScreen> createState() => _OfflineSetupScreenState();
}

class _OfflineSetupScreenState extends State<OfflineSetupScreen> {
  final List<TextEditingController> _controllers = [];
  Timer? _holdTimer;

  @override
  void initState() {
    super.initState();
    final controller = context.read<GameController>();
    final l10n = SpyLocalizations.forLanguage(controller.state.language);
    final existing = controller.state.players.isNotEmpty
        ? controller.state.players.map((p) => p.name).toList()
        : controller.savedNames.isNotEmpty
            ? controller.savedNames
            : List<String>.generate(
                controller.state.settings.playerCount, (i) => l10n.agentHint(i));
    for (final name in existing) {
      _controllers.add(TextEditingController(text: name));
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    _stopHold();
    super.dispose();
  }

  void _syncControllerLength(int desired) {
    final l10n =
        SpyLocalizations.forLanguage(context.read<GameController>().state.language);
    if (desired > _controllers.length) {
      for (var i = _controllers.length; i < desired; i++) {
        _controllers.add(TextEditingController(text: l10n.agentHint(i)));
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

  void _startGame(GameController controller) {
    final l10n = SpyLocalizations.forLanguage(controller.state.language);
    final names = _controllers.map((c) => c.text.trim()).toList();

    for (final name in names) {
      if (name.isEmpty) {
        _showMessage(l10n.text('codeNameRequired'));
        return;
      }
      if (name.length > 16) {
        _showMessage(l10n.text('maxNameLength'));
        return;
      }
      if (!RegExp(r'^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$').hasMatch(name)) {
        _showMessage(l10n.text('lettersOnly'));
        return;
      }
      if (containsProfanity(name)) {
        _showMessage(l10n.nameNotAllowed(name));
        return;
      }
    }
    if (names.toSet().length != names.length) {
      _showMessage(l10n.text('noDuplicates'));
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
    Notifier.show(context, text, error: true);
  }

  void _adjustTimer(GameController controller, int delta) {
    final next = (controller.state.settings.timerDuration + delta).clamp(5, 30);
    controller.updateSettings(timerDuration: next);
    setState(() {});
  }

  void _startHold(GameController controller, int delta) {
    _holdTimer?.cancel();
    _holdTimer = Timer.periodic(
      const Duration(milliseconds: 120),
      (_) => _adjustTimer(controller, delta),
    );
  }

  void _stopHold() {
    _holdTimer?.cancel();
    _holdTimer = null;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, _) {
        final l10n = context.l10n;
        final settings = controller.state.settings;
        _syncControllerLength(settings.playerCount);

        return SpyScaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                context.read<GameController>().playClick();
                Navigator.of(context).pop();
              },
            ),
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            scrolledUnderElevation: 0,
            elevation: 0,
            title: Text(l10n.text('missionSetup')),
          ),
          bottom: SafeArea(
            minimum: const EdgeInsets.fromLTRB(16, 0, 16, 28),
            child: ElevatedButton.icon(
              onPressed: () {
                controller.playClick();
                _startGame(controller);
              },
              icon: const Icon(Icons.play_arrow_rounded),
              label: Text(l10n.text('startMission')),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Theme.of(context).colorScheme.onPrimary,
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
                label: l10n.text('agents'),
                icon: Icons.badge_outlined,
                value: settings.playerCount,
                min: 4,
                max: 8,
                onChanged: (val) => _changePlayerCount(controller, val),
                helper: l10n.text('agentsHelper'),
              ),
              const SizedBox(height: 12),
              _CounterTile(
                label: l10n.text('spies'),
                icon: Icons.person_search_rounded,
                value: settings.playerCount <= 5 ? 1 : settings.spyCount,
                min: 1,
                max: settings.playerCount > 5 ? 2 : 1,
                locked: settings.playerCount <= 5,
                onChanged: (val) => _changeSpyCount(controller, val),
                helper: settings.playerCount <= 5
                    ? l10n.text('spiesHelperLocked')
                    : l10n.text('spiesHelper'),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: OutlinedButton.icon(
                  onPressed: () async {
                    controller.playClick();
                    final result = await Navigator.of(context).push<List<String>>(
                      MaterialPageRoute(
                        builder: (_) => AgentRosterScreen(
                            initialNames: _controllers.map((c) => c.text).toList()),
                      ),
                    );
                    if (!context.mounted) return;
                    if (result != null) {
                      setState(() {
                        _controllers.clear();
                        for (final name in result) {
                          _controllers.add(TextEditingController(text: name));
                        }
                      });
                      Notifier.show(context, l10n.text('namesSaved'));
                    }
                  },
                  icon: const Icon(Icons.manage_accounts),
                  label: Text(l10n.text('manageRoster')),
                ),
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
                          Row(
                            children: [
                              const Icon(Icons.schedule_outlined,
                                  color: Colors.white70),
                              const SizedBox(width: 8),
                              Text(
                                l10n.text('missionTimer'),
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          Switch(
                            value: settings.isTimerOn,
                            onChanged: (val) {
                              controller.playClick();
                              controller.updateSettings(isTimerOn: val);
                            },
                          ),
                        ],
                      ),
                      if (settings.isTimerOn) ...[
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              child: Text(
                                l10n.text('timerRange'),
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(color: Colors.white70),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                GestureDetector(
                                  onLongPressStart: (_) {
                                    controller.playClick();
                                    _startHold(controller, -1);
                                  },
                                  onLongPressEnd: (_) => _stopHold(),
                                  child: IconButton(
                                    onPressed: settings.timerDuration > 5
                                        ? () {
                                            controller.playClick();
                                            _adjustTimer(controller, -1);
                                          }
                                        : null,
                                    icon: const Icon(Icons.remove_circle_outline),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 8),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                        color:
                                            Colors.white.withValues(alpha: 0.2)),
                                  ),
                                  child: Text(
                                    '${settings.timerDuration} ${l10n.language == Language.tr ? 'dk' : 'min'}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w700),
                                  ),
                                ),
                                GestureDetector(
                                  onLongPressStart: (_) {
                                    controller.playClick();
                                    _startHold(controller, 1);
                                  },
                                  onLongPressEnd: (_) => _stopHold(),
                                  child: IconButton(
                                    onPressed: settings.timerDuration < 30
                                        ? () {
                                            controller.playClick();
                                            _adjustTimer(controller, 1);
                                          }
                                        : null,
                                    icon: const Icon(Icons.add_circle_outline),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Text(
                          l10n.timerLength(settings.timerDuration),
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.white70),
                        ),
                      ] else
                        Text(
                          l10n.text('noTimer'),
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.white70),
                        ),
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        onPressed: () {
                          controller.playClick();
                          Navigator.of(context).pushNamed('/locations');
                        },
                        icon: const Icon(Icons.map_outlined),
                        label: Text(l10n.text('manageLocations')),
                      ),
                    ],
                  ),
                ),
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
    this.icon,
    this.helper,
    this.locked = false,
  });

  final String label;
  final int value;
  final int min;
  final int max;
  final bool locked;
  final void Function(int) onChanged;
  final IconData? icon;
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
                Row(
                  children: [
                    if (icon != null) ...[
                      Icon(icon, color: Colors.white70),
                      const SizedBox(width: 8),
                    ],
                    Text(label,
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: (!locked && value > min)
                          ? () {
                              context.read<GameController>().playClick();
                              onChanged(value - 1);
                            }
                          : null,
                      icon: const Icon(Icons.remove_circle_outline),
                    ),
                    Text('$value',
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 18)),
                    IconButton(
                      onPressed: (!locked && value < max)
                          ? () {
                              context.read<GameController>().playClick();
                              onChanged(value + 1);
                            }
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
                  context.l10n.text('lockedDueToAgents'),
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
