import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';

class GameRoomScreen extends StatelessWidget {
  const GameRoomScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, _) {
        final state = controller.state;
        if (state.players.isEmpty) {
          return SpyScaffold(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('No mission in progress.'),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () =>
                      Navigator.of(context).pushReplacementNamed('/'),
                  child: const Text('Back to menu'),
                ),
              ],
            ),
          );
        }

        Widget body;
        switch (state.phase) {
          case GamePhase.reveal:
            body = const _RoleRevealView();
            break;
          case GamePhase.playing:
            body = const _DiscussionView();
            break;
          case GamePhase.voting:
            body = const _VotingView();
            break;
          case GamePhase.result:
            body = const _ResultView();
            break;
          default:
            body = const SizedBox.shrink();
        }

        return PopScope(
          canPop: false,
          child: SpyScaffold(
            scrollable: false,
            appBar: AppBar(
              automaticallyImplyLeading: false,
              title: Text(
                state.phase == GamePhase.reveal
                    ? 'Identity Reveal'
                    : state.phase == GamePhase.playing
                        ? 'Interrogation'
                        : state.phase == GamePhase.voting
                            ? 'Vote'
                            : 'Results',
              ),
            ),
            child: body,
          ),
        );
      },
    );
  }
}

class _RoleRevealView extends StatefulWidget {
  const _RoleRevealView();

  @override
  State<_RoleRevealView> createState() => _RoleRevealViewState();
}

class _RoleRevealViewState extends State<_RoleRevealView> {
  bool revealed = false;
  double progress = 0;
  Timer? _scanTimer;

  @override
  Widget build(BuildContext context) {
    final controller = context.read<GameController>();
    final state = controller.state;
    final player = state.players[state.gameData.currentRevealIndex];
    final isLast =
        state.gameData.currentRevealIndex == state.players.length - 1;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Agent ${state.gameData.currentRevealIndex + 1} / ${state.players.length}',
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 8),
          Text(
            player.name,
            style: Theme.of(context)
                .textTheme
                .headlineMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onLongPressStart: (_) => _startScan(() {
              setState(() => revealed = true);
            }),
            onLongPressEnd: (_) => _stopScan(),
            child: Card(
              child: Container(
                padding: const EdgeInsets.all(24),
                width: 300,
                child: revealed
                    ? _RoleCardBody(
                        player: player,
                        location: state.gameData.currentLocation,
                      )
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 120,
                                height: 120,
                                child: CircularProgressIndicator(
                                  value: progress,
                                  strokeWidth: 6,
                                  color: Colors.lightBlueAccent,
                                ),
                              ),
                              Icon(Icons.fingerprint,
                                  size: 72,
                                  color: Colors.white.withValues(alpha: 0.6)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text('Hold finger to scan'),
                        ],
                      ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: revealed
                ? () {
                    if (isLast) {
                      controller.startPlaying();
                    } else {
                      setState(() {
                        revealed = false;
                        progress = 0;
                      });
                      controller.nextReveal();
                    }
                  }
                : null,
            style: ElevatedButton.styleFrom(minimumSize: const Size(220, 52)),
            child: Text(isLast ? 'Start Mission' : 'Next Agent'),
          ),
        ],
      ),
    );
  }

  void _startScan(VoidCallback onComplete) {
    progress = 0;
    _scanTimer?.cancel();
    _scanTimer = Timer.periodic(const Duration(milliseconds: 80), (timer) {
      setState(() {
        progress += 0.08;
        if (progress >= 1) {
          _stopScan();
          onComplete();
        }
      });
    });
  }

  void _stopScan() {
    _scanTimer?.cancel();
    _scanTimer = null;
    if (!revealed) {
      setState(() {
        progress = 0;
      });
    }
  }

  @override
  void dispose() {
    _scanTimer?.cancel();
    super.dispose();
  }
}

class _RoleCardBody extends StatelessWidget {
  const _RoleCardBody({required this.player, required this.location});

  final Player player;
  final String location;

  @override
  Widget build(BuildContext context) {
    final isSpy = player.role == Role.spy;
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        CircleAvatar(
          radius: 42,
          backgroundColor: isSpy
              ? Colors.redAccent.withValues(alpha: 0.25)
              : Colors.blueAccent.withValues(alpha: 0.2),
          child: Icon(
            isSpy ? Icons.visibility_off_outlined : Icons.person_outline,
            size: 40,
            color: isSpy ? Colors.redAccent : Colors.blueAccent,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          isSpy ? 'You are the SPY' : 'Civilian',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: isSpy ? Colors.redAccent : Colors.blueAccent,
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: 8),
        if (!isSpy)
          Column(
            children: [
              Text('Secret Location',
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 6),
              Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.blueAccent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: Colors.blueAccent.withValues(alpha: 0.4)),
                ),
                child: Text(
                  location,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          )
        else
          const Text(
            'Blend in. Listen closely and guess the location.',
            textAlign: TextAlign.center,
          ),
      ],
    );
  }
}

class _DiscussionView extends StatelessWidget {
  const _DiscussionView();

  String _format(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();
    final state = controller.state;
    final spiesRemaining =
        state.players.where((p) => p.role == Role.spy && !p.isDead).length;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (state.settings.isTimerOn)
          Column(
            children: [
              Icon(
                Icons.timer,
                size: 72,
                color: state.gameData.timeLeft < 60
                    ? Colors.redAccent
                    : Colors.lightBlueAccent,
              ),
              const SizedBox(height: 8),
              Text(
                _format(state.gameData.timeLeft),
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      color: state.gameData.timeLeft < 60
                          ? Colors.redAccent
                          : Colors.white,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
              ),
            ],
          )
        else
          Column(
            children: [
              const Icon(Icons.hourglass_disabled,
                  size: 52, color: Colors.white70),
              const SizedBox(height: 8),
              Text(
                'No timer',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
        const SizedBox(height: 32),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Column(
            children: [
              _StatBlock(
                label: 'Agents Active',
                value: state.players.where((p) => !p.isDead).length.toString(),
              ),
              const SizedBox(height: 12),
              _StatBlock(
                label: 'Spies Remaining',
                value: spiesRemaining.toString(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        Column(
          children: [
            ElevatedButton.icon(
              onPressed: controller.startVoting,
              icon: const Icon(Icons.how_to_vote),
              label: const Text('Call Vote'),
              style: ElevatedButton.styleFrom(minimumSize: const Size(240, 52)),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () => _confirmExit(context, controller),
              icon: const Icon(Icons.logout),
              label: const Text('Main Menu'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                minimumSize: const Size(240, 52),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _confirmExit(BuildContext context, GameController controller) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Leave Mission?'),
          content:
              const Text('Are you sure you want to return to the main menu?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Stay'),
            ),
            ElevatedButton.icon(
              onPressed: () {
                controller.resetGame();
                Navigator.of(ctx).pop();
                Navigator.of(context)
                    .pushNamedAndRemoveUntil('/', (route) => false);
              },
              icon: const Icon(Icons.exit_to_app),
              label: const Text('Main Menu'),
              style:
                  ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            ),
          ],
        );
      },
    );
  }
}

class _VotingView extends StatefulWidget {
  const _VotingView();

  @override
  State<_VotingView> createState() => _VotingViewState();
}

class _VotingViewState extends State<_VotingView> {
  String? selected;

  @override
  Widget build(BuildContext context) {
    final controller = context.read<GameController>();
    final living = controller.state.players.where((p) => !p.isDead).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 12),
        Center(
          child: Text(
            'Emergency meeting',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: Colors.redAccent),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: ListView.separated(
            itemBuilder: (_, index) {
              final player = living[index];
              final isSelected = selected == player.id;
              return ListTile(
                onTap: () => setState(() => selected = player.id),
                leading: CircleAvatar(
                  backgroundColor: isSelected
                      ? Colors.redAccent
                      : Colors.white.withValues(alpha: 0.1),
                  child: Text(player.name[0].toUpperCase()),
                ),
                title: Text(player.name),
                trailing: isSelected
                    ? const Icon(Icons.check, color: Colors.redAccent)
                    : null,
              );
            },
            separatorBuilder: (_, __) =>
                const Divider(height: 1, color: Colors.white24),
            itemCount: living.length,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => controller.startPlaying(),
                child: const Text('Cancel'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: selected == null
                    ? null
                    : () {
                        controller.eliminatePlayer(selected!);
                        setState(() => selected = null);
                      },
                icon: const Icon(Icons.warning_amber_rounded),
                label: const Text('Eliminate'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}

class _ResultView extends StatelessWidget {
  const _ResultView();

  @override
  Widget build(BuildContext context) {
    final controller = context.read<GameController>();
    final state = controller.state;
    final winner = state.gameData.winner;
    final spies = state.players.where((p) => p.role == Role.spy).toList();

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.emoji_events,
            size: 96,
            color:
                winner == Role.spy ? Colors.redAccent : Colors.lightBlueAccent,
          ),
          const SizedBox(height: 12),
          Text(
            winner == Role.spy ? 'Spies win' : 'Civilians win',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: winner == Role.spy
                      ? Colors.redAccent
                      : Colors.lightBlueAccent,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 12),
          Text('Secret location: ${state.gameData.currentLocation}'),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Spies',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ...spies.map((spy) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            const Icon(Icons.fingerprint,
                                size: 18, color: Colors.redAccent),
                            const SizedBox(width: 8),
                            Text(spy.name),
                            if (spy.isDead)
                              Container(
                                margin: const EdgeInsets.only(left: 8),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color:
                                      Colors.redAccent.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Text(
                                  'Caught',
                                  style: TextStyle(
                                      color: Colors.redAccent, fontSize: 12),
                                ),
                              ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                ElevatedButton.icon(
                  onPressed: controller.resetGame,
                  icon: const Icon(Icons.replay_outlined),
                  label: const Text('Play again'),
                  style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(52)),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => Navigator.of(context)
                      .pushNamedAndRemoveUntil('/', (route) => false),
                  icon: const Icon(Icons.home_outlined),
                  label: const Text('Back to menu'),
                  style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(52)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBlock extends StatelessWidget {
  const _StatBlock({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value,
              style:
                  const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: Colors.white70)),
        ],
      ),
    );
  }
}
