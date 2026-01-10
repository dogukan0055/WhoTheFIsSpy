import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';

class SpyGuessScreen extends StatefulWidget {
  const SpyGuessScreen({super.key});

  @override
  State<SpyGuessScreen> createState() => _SpyGuessScreenState();
}

class _SpyGuessScreenState extends State<SpyGuessScreen> {
  String? _selectedLocation;
  final Map<String, bool> _expanded = {};
  bool _timerStopped = false;

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, _) {
        final state = controller.state;
        final l10n = context.l10n;
        final spyName = state.players
            .firstWhere((p) => p.role == Role.spy && !p.isDead,
                orElse: () =>
                    state.players.firstWhere((p) => p.role == Role.spy))
            .name;

        final categories = state.gameData.categories
            .where((c) => state.settings.selectedCategories.contains(c.id))
            .toList();

        if (!_timerStopped) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            controller.pauseGame();
            controller.stopTimerForce();
          });
          _timerStopped = true;
        }

        return PopScope(
          canPop: false,
          child: SpyScaffold(
            appBar: AppBar(
              automaticallyImplyLeading: false,
              title: Text(l10n.text('spyGuessTitle')),
              centerTitle: true,
              backgroundColor: Colors.transparent,
              surfaceTintColor: Colors.transparent,
              scrolledUnderElevation: 0,
              elevation: 0,
            ),
            child: Stack(
              children: [
                ClipRect(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                    child: Container(
                      color: Colors.black.withValues(alpha: 0.35),
                    ),
                  ),
                ),
                SingleChildScrollView(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        child: Text(
                          l10n.text('spyGuessPrompt')
                              .replaceAll('{name}', spyName),
                          style: Theme.of(context)
                              .textTheme
                              .bodyLarge
                              ?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Text(
                          _selectedLocation == null
                              ? l10n.text('spyGuessYourGuessEmpty')
                              : l10n
                                  .text('spyGuessYourGuess')
                                  .replaceAll('{location}',
                                      l10n.locationName(_selectedLocation!)),
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(
                                  color: Colors.white70,
                                  fontWeight: FontWeight.w600),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      ...categories.map((cat) {
                        final expanded = _expanded[cat.id] ?? false;
                        final activeLocations = cat.locations
                            .where(
                                (loc) => !cat.disabledLocations.contains(loc))
                            .toList();
                        return Container(
                          margin: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: Colors.white.withValues(alpha: 0.1)),
                          ),
                          child: Column(
                            children: [
                              ListTile(
                                title: Text(
                                  l10n.categoryName(cat.name),
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                trailing: Icon(
                                  expanded
                                      ? Icons.expand_less
                                      : Icons.expand_more,
                                ),
                                onTap: () {
                                  setState(
                                      () => _expanded[cat.id] = !expanded);
                                },
                              ),
                              ClipRect(
                                child: AnimatedSwitcher(
                                  duration: const Duration(milliseconds: 220),
                                  switchInCurve: Curves.easeOut,
                                  switchOutCurve: Curves.easeIn,
                                  transitionBuilder: (child, animation) =>
                                      FadeTransition(
                                    opacity: animation,
                                    child: SizeTransition(
                                      sizeFactor: animation,
                                      child: child,
                                    ),
                                  ),
                                  child: expanded
                                      ? Column(
                                          key: ValueKey('expanded-${cat.id}'),
                                          children: activeLocations.map((loc) {
                                            final locName =
                                                l10n.locationName(loc);
                                            final isSelected =
                                                _selectedLocation == loc;
                                            return ListTile(
                                              onTap: () {
                                                setState(() =>
                                                    _selectedLocation = loc);
                                                if (controller
                                                    .state.appSettings
                                                    .vibrate) {
                                                  HapticFeedback
                                                      .selectionClick();
                                                }
                                              },
                                              leading: Icon(
                                                isSelected
                                                    ? Icons
                                                        .radio_button_checked
                                                    : Icons.radio_button_off,
                                                color: isSelected
                                                    ? Theme.of(context)
                                                        .colorScheme
                                                        .primary
                                                    : Colors.white70,
                                              ),
                                              title: Text(locName),
                                              selected: isSelected,
                                              selectedColor:
                                                  Theme.of(context)
                                                      .colorScheme
                                                      .primary,
                                            );
                                          }).toList(),
                                        )
                                      : const SizedBox.shrink(),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 18),
                        child: ElevatedButton.icon(
                          onPressed: _selectedLocation == null
                              ? null
                              : () {
                                  controller.playClick();
                                  controller.resolveSpyGuess(
                                      _selectedLocation!);
                                  Navigator.of(context)
                                      .pushReplacementNamed('/game');
                                },
                          icon: const Icon(Icons.check_circle_outline),
                          label: Text(l10n.text('spyGuessSubmit')),
                          style: ElevatedButton.styleFrom(
                              minimumSize: const Size.fromHeight(52)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
