import 'dart:async';

import 'package:flutter/material.dart';

import '../models/game_models.dart';

class GamePage extends StatefulWidget {
  const GamePage({super.key, required this.round});

  final GameRound round;

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  Timer? _ticker;
  late Duration _remaining;
  bool _revealRoles = false;

  @override
  void initState() {
    super.initState();
    _remaining = widget.round.roundDuration;
    _startTimer();
  }

  void _startTimer() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remaining.inSeconds <= 1) {
        timer.cancel();
        setState(() {
          _remaining = Duration.zero;
        });
        return;
      }
      setState(() {
        _remaining = Duration(seconds: _remaining.inSeconds - 1);
      });
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  String _formatTime(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final prompt = widget.round.prompt;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Round in progress'),
        actions: [
          TextButton.icon(
            onPressed: () {
              setState(() {
                _revealRoles = !_revealRoles;
              });
            },
            icon: Icon(_revealRoles ? Icons.visibility_off_outlined : Icons.visibility_outlined),
            label: Text(_revealRoles ? 'Hide roles' : 'Reveal roles'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        const CircleAvatar(child: Icon(Icons.timer_outlined)),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Word: ${prompt.topic}',
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              const SizedBox(height: 4),
                              Text(prompt.hint, style: Theme.of(context).textTheme.bodyMedium),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Chip(
                          avatar: const Icon(Icons.visibility_off_outlined),
                          label: Text('${widget.round.spyCount} spy${widget.round.spyCount > 1 ? 's' : ''}'),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  color: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text(
                          _remaining == Duration.zero ? 'Time is up!' : _formatTime(_remaining),
                          style: Theme.of(context)
                              .textTheme
                              .displaySmall
                              ?.copyWith(color: Colors.white, letterSpacing: 4),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Use this timer to keep debates moving.',
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(color: Colors.grey.shade300),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Players',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 12),
                        ...widget.round.roles.map((role) {
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor:
                                  role.isSpy ? Colors.red.shade100 : Colors.green.shade100,
                              foregroundColor: role.isSpy ? Colors.red.shade700 : Colors.green.shade700,
                              child: Icon(role.isSpy ? Icons.visibility_off : Icons.check),
                            ),
                            title: Text(role.name),
                            subtitle: _revealRoles
                                ? Text(role.isSpy ? 'Spy' : 'Civilian')
                                : const Text('Hidden until reveal'),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
