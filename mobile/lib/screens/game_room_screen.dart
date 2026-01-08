import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
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
        final l10n = context.l10n;
        if (state.players.isEmpty) {
          return SpyScaffold(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(l10n.text('noMission')),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () =>
                      Navigator.of(context).pushReplacementNamed('/'),
                  child: Text(l10n.text('backToMenu')),
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
                    ? l10n.text('identityReveal')
                    : state.phase == GamePhase.playing
                        ? l10n.text('interrogationPhase')
                        : state.phase == GamePhase.voting
                            ? l10n.text('vote')
                            : l10n.text('results'),
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
    final l10n = context.l10n;
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
            l10n.agentRevealCounter(
                state.gameData.currentRevealIndex + 1, state.players.length),
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
                          Text(l10n.text('holdToScan')),
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
            child: Text(
                isLast ? l10n.text('startMission') : l10n.text('nextAgent')),
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
    final l10n = context.l10n;
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
          isSpy ? l10n.text('youAreSpy') : l10n.text('civilian'),
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: isSpy ? Colors.redAccent : Colors.blueAccent,
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: 8),
        if (!isSpy)
          Column(
            children: [
              Text(l10n.text('secretLocation'),
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
          Text(
            l10n.text('blendIn'),
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
    final l10n = context.l10n;

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
                l10n.text('noTimerShort'),
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
                label: l10n.text('agentsActive'),
                value: state.players.where((p) => !p.isDead).length.toString(),
              ),
              const SizedBox(height: 12),
              _StatBlock(
                label: l10n.text('spiesRemaining'),
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
              label: Text(l10n.text('callVote')),
              style: ElevatedButton.styleFrom(minimumSize: const Size(240, 52)),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () => _confirmExit(context, controller),
              icon: const Icon(Icons.logout),
              label: Text(l10n.text('mainMenu')),
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
    final l10n = context.l10n;
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text(l10n.text('leaveMission')),
          content: Text(l10n.text('returnToMenu')),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text(l10n.text('stay')),
            ),
            ElevatedButton.icon(
              onPressed: () {
                controller.resetGame();
                Navigator.of(ctx).pop();
                Navigator.of(context)
                    .pushNamedAndRemoveUntil('/', (route) => false);
              },
              icon: const Icon(Icons.exit_to_app),
              label: Text(l10n.text('mainMenu')),
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
    final l10n = context.l10n;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 12),
        Center(
          child: Text(
            l10n.text('emergencyMeeting'),
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
                child: Text(l10n.text('cancel')),
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
                label: Text(l10n.text('eliminate')),
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
    final l10n = context.l10n;

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
            winner == Role.spy
                ? l10n.text('spiesWin')
                : l10n.text('civiliansWinResult'),
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: winner == Role.spy
                      ? Colors.redAccent
                      : Colors.lightBlueAccent,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 12),
          Text(l10n.secretLocationReveal(state.gameData.currentLocation)),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.text('spiesHeader'),
                      style: const TextStyle(fontWeight: FontWeight.bold)),
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
                                child: Text(
                                  l10n.text('caught'),
                                  style: const TextStyle(
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
                  label: Text(l10n.text('playAgain')),
                  style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(52)),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => Navigator.of(context)
                      .pushNamedAndRemoveUntil('/', (route) => false),
                  icon: const Icon(Icons.home_outlined),
                  label: Text(l10n.text('backToMenu')),
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
