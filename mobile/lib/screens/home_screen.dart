import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';
import '../widgets/notifier.dart';

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
    final controller = context.read<GameController>();
    final l10n = context.l10n;
    final isTurkish = l10n.language == Language.tr;
    final letterSpacingTight = isTurkish ? 0.1 : -1.1;

    return SpyScaffold(
      scrollable: false,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () {
                  controller.playClick();
                  Navigator.of(context).pushNamed('/settings');
                },
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
                  l10n.text('appTitleTop'),
                  style: textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    letterSpacing: letterSpacingTight,
                  ),
                ),
                Text(
                  l10n.text('appTitleMid'),
                  style: textTheme.displayMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: colorScheme.primary,
                    letterSpacing: letterSpacingTight,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            l10n.text('homeTagline'),
            style: textTheme.bodyMedium?.copyWith(color: Colors.white70),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 36),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(58),
            ),
            onPressed: () {
              controller.playClick();
              _goTo(context, '/setup', GameMode.offline);
            },
            icon: const Icon(Icons.phone_android),
            label: Text(l10n.text('offlineMode')),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(58),
            ),
            onPressed: () {
              controller.playClick();
              Notifier.show(context, l10n.text('onlineComing'), warning: true);
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
          FutureBuilder<String>(
            future: PackageInfo.fromPlatform().then((info) {
              final build = info.buildNumber.isNotEmpty ? '+${info.buildNumber}' : '';
              return 'v${info.version}$build';
            }),
            builder: (context, snapshot) {
              final version = snapshot.data;
              if (version == null || version.isEmpty) {
                return const SizedBox.shrink();
              }
              return Text(
                version,
                style: textTheme.bodySmall?.copyWith(color: Colors.white38),
              );
            },
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
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.swipe_vertical,
                        size: 18, color: Colors.white70),
                    const SizedBox(width: 8),
                    Text(
                      l10n.text('swipeHint'),
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
