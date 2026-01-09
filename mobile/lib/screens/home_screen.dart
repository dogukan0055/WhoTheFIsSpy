import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _goTo(BuildContext context, String route, GameMode mode) {
    final controller = context.read<GameController>();
    controller.setMode(mode);
    Navigator.of(context).pushNamed(route);
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;
    final controller = context.watch<GameController>();
    final isLight = controller.state.themeMode == ThemeMode.light;
    final l10n = context.l10n;

    return SpyScaffold(
      scrollable: false,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: Icon(isLight
                    ? Icons.dark_mode_outlined
                    : Icons.light_mode_outlined),
                tooltip: l10n.text('toggleTheme'),
                onPressed: () => controller.toggleThemeMode(),
              ),
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () => Navigator.of(context).pushNamed('/settings'),
              ),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.03),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              children: [
                Text(
                  'WHO THE',
                  style: textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1.5,
                  ),
                ),
                Text(
                  'F***',
                  style: textTheme.displayMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: colorScheme.primary,
                    letterSpacing: -1.5,
                  ),
                ),
                Text(
                  'IS SPY?',
                  style: textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            l10n.text('homeTagline'),
            style: textTheme.bodyMedium?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 36),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(58),
            ),
            onPressed: () => _goTo(context, '/setup', GameMode.offline),
            icon: const Icon(Icons.phone_android),
            label: Text(l10n.text('offlineMode')),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(58),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(l10n.text('onlineComing'))),
              );
            },
            icon: const Icon(Icons.wifi_off_outlined),
            label: Text(l10n.text('onlineMode')),
          ),
          const SizedBox(height: 20),
          TextButton.icon(
            onPressed: () => _showHowToPlay(context),
            icon: const Icon(Icons.help_outline),
            label: Text(l10n.text('howToPlay')),
          ),
          const Spacer(),
          Text(
            'v1.1.0 demo',
            style: textTheme.bodySmall?.copyWith(color: Colors.white38),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  void _showHowToPlay(BuildContext context) {
    final l10n = context.l10n;
    showModalBottomSheet(
      context: context,
      backgroundColor:
          Theme.of(context).colorScheme.surface.withValues(alpha: 0.95),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.text('missionBriefing'),
                  style: Theme.of(ctx).textTheme.titleLarge?.copyWith(
                        color: Theme.of(ctx).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.text('objective'),
                  style: Theme.of(ctx).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(l10n.text('objectiveAgent')),
                Text(l10n.text('objectiveSpy')),
                const SizedBox(height: 16),
                Text(
                  l10n.text('gameplay'),
                  style: Theme.of(ctx).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(l10n.text('gameplayStep1')),
                Text(l10n.text('gameplayStep2')),
                Text(l10n.text('gameplayStep3')),
                const SizedBox(height: 16),
                Text(
                  l10n.text('winConditions'),
                  style: Theme.of(ctx).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(l10n.text('spyWins')),
                Text(l10n.text('agentsWin')),
              ],
            ),
          ),
        );
      },
    );
  }
}
