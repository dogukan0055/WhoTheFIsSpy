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
                  onPressed: () => Navigator.of(context).pushReplacementNamed('/'),
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

        return SpyScaffold(
          scrollable: false,
          appBar: AppBar(
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

  @override
  Widget build(BuildContext context) {
    final controller = context.read<GameController>();
    final state = controller.state;
    final player = state.players[state.gameData.currentRevealIndex];
    final isLast = state.gameData.currentRevealIndex == state.players.length - 1;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Agent ${state.gameData.currentRevealIndex + 1} / ${state.players.length}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 8),
          Text(
            player.name,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          Card(
            child: Container(
              padding: const EdgeInsets.all(24),
              width: 300,
              child: revealed
                  ? _RoleCardBody(player: player, location: state.gameData.currentLocation)
                  : Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.fingerprint, size: 64, color: Colors.white.withOpacity(0.4)),
                        const SizedBox(height: 16),
                        const Text('Pass the phone to this agent, then reveal.'),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              if (!revealed) {
                setState(() => revealed = true);
              } else if (isLast) {
                controller.startPlaying();
              } else {
                setState(() => revealed = false);
                controller.nextReveal();
              }
            },
            style: ElevatedButton.styleFrom(minimumSize: const Size(220, 52)),
            child: Text(!revealed
                ? 'Reveal Identity'
                : isLast
                    ? 'Start Mission'
                    : 'Next Agent'),
          ),
        ],
      ),
    );
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
          backgroundColor: isSpy ? Colors.redAccent.withOpacity(0.25) : Colors.blueAccent.withOpacity(0.2),
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
              Text('Secret Location', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.blueAccent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blueAccent.withOpacity(0.4)),
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
    final controller = context.read<GameController>();
    final state = controller.state;
    final spiesRemaining = state.players.where((p) => p.role == Role.spy && !p.isDead).length;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (state.settings.isTimerOn)
          Column(
            children: [
              Icon(
                Icons.timer,
                size: 52,
                color: state.gameData.timeLeft < 60 ? Colors.redAccent : Colors.lightBlueAccent,
              ),
              const SizedBox(height: 8),
              Text(
                _format(state.gameData.timeLeft),
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: state.gameData.timeLeft < 60 ? Colors.redAccent : Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          )
        else
          Column(
            children: [
              const Icon(Icons.hourglass_disabled, size: 52, color: Colors.white70),
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
        ElevatedButton.icon(
          onPressed: controller.startVoting,
          icon: const Icon(Icons.how_to_vote),
          label: const Text('Call Vote'),
          style: ElevatedButton.styleFrom(minimumSize: const Size(220, 52)),
        ),
      ],
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
            style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.redAccent),
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
                  backgroundColor: isSelected ? Colors.redAccent : Colors.white.withOpacity(0.1),
                  child: Text(player.name[0].toUpperCase()),
                ),
                title: Text(player.name),
                trailing: isSelected ? const Icon(Icons.check, color: Colors.redAccent) : null,
              );
            },
            separatorBuilder: (_, __) => const Divider(height: 1, color: Colors.white24),
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
            color: winner == Role.spy ? Colors.redAccent : Colors.lightBlueAccent,
          ),
          const SizedBox(height: 12),
          Text(
            winner == Role.spy ? 'Spies win' : 'Civilians win',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: winner == Role.spy ? Colors.redAccent : Colors.lightBlueAccent,
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
                  const Text('Spies', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ...spies.map((spy) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            const Icon(Icons.fingerprint, size: 18, color: Colors.redAccent),
                            const SizedBox(width: 8),
                            Text(spy.name),
                            if (spy.isDead)
                              Container(
                                margin: const EdgeInsets.only(left: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Text(
                                  'Caught',
                                  style: TextStyle(color: Colors.redAccent, fontSize: 12),
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
                  style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false),
                  icon: const Icon(Icons.home_outlined),
                  label: const Text('Back to menu'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
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
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70)),
        ],
      ),
    );
  }
}
