import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';

enum _OnlineStep { name, menu, join, lobby }

class OnlineMenuScreen extends StatefulWidget {
  const OnlineMenuScreen({super.key});

  @override
  State<OnlineMenuScreen> createState() => _OnlineMenuScreenState();
}

class _OnlineMenuScreenState extends State<OnlineMenuScreen> {
  _OnlineStep step = _OnlineStep.name;
  final TextEditingController nameCtrl = TextEditingController();
  final TextEditingController codeCtrl = TextEditingController();
  bool isLoading = false;
  bool isHost = false;
  List<String> players = [];
  Timer? _mockTimer;

  @override
  void dispose() {
    _mockTimer?.cancel();
    nameCtrl.dispose();
    codeCtrl.dispose();
    super.dispose();
  }

  void _simulateLobby() {
    _mockTimer?.cancel();
    players = [nameCtrl.text.trim()];
    _mockTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (players.length >= 5) {
        timer.cancel();
        return;
      }
      const sample = ['Cipher', 'Echo', 'Phantom', 'Shade', 'Nova'];
      setState(() => players.add(sample[players.length - 1]));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${players.last} joined the lobby')),
      );
    });
  }

  void _connect() {
    if (nameCtrl.text.trim().isEmpty) return;
    setState(() => isLoading = true);
    Future.delayed(const Duration(milliseconds: 800), () {
      setState(() {
        isLoading = false;
        step = _OnlineStep.menu;
      });
    });
  }

  void _host() {
    final rng = Random();
    codeCtrl.text = (rng.nextInt(9000) + 1000).toString();
    isHost = true;
    step = _OnlineStep.lobby;
    _simulateLobby();
  }

  void _join() {
    step = _OnlineStep.join;
  }

  void _submitJoin() {
    if (codeCtrl.text.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid 4 digit code')),
      );
      return;
    }
    isHost = false;
    step = _OnlineStep.lobby;
    _simulateLobby();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GameController>();
    // Ensure mode stays online for context.
    if (controller.state.mode != GameMode.online) {
      controller.setMode(GameMode.online);
    }

    return SpyScaffold(
      scrollable: false,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Online Ops'),
      ),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: switch (step) {
          _OnlineStep.name => _NameStep(
              controller: nameCtrl,
              isLoading: isLoading,
              onConnect: _connect,
            ),
          _OnlineStep.menu => _MenuStep(
              name: nameCtrl.text,
              onHost: () => setState(_host),
              onJoin: () => setState(_join),
            ),
          _OnlineStep.join => _JoinStep(
              controller: codeCtrl,
              isLoading: isLoading,
              onSubmit: () => setState(_submitJoin),
            ),
          _OnlineStep.lobby => _LobbyStep(
              code: codeCtrl.text,
              players: players,
              isHost: isHost,
            ),
        },
      ),
    );
  }
}

class _NameStep extends StatelessWidget {
  const _NameStep({
    required this.controller,
    required this.isLoading,
    required this.onConnect,
  });

  final TextEditingController controller;
  final bool isLoading;
  final VoidCallback onConnect;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.public, size: 72, color: Colors.lightBlueAccent),
        const SizedBox(height: 16),
        TextField(
          controller: controller,
          textAlign: TextAlign.center,
          decoration: const InputDecoration(labelText: 'Codename'),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: isLoading ? null : onConnect,
          child: isLoading
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Establish Uplink'),
        ),
      ],
    );
  }
}

class _MenuStep extends StatelessWidget {
  const _MenuStep({
    required this.name,
    required this.onHost,
    required this.onJoin,
  });

  final String name;
  final VoidCallback onHost;
  final VoidCallback onJoin;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Connected as ${name.toUpperCase()}',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.greenAccent),
        ),
        const SizedBox(height: 28),
        ElevatedButton.icon(
          onPressed: onHost,
          icon: const Icon(Icons.wifi_tethering),
          label: const Text('Host operation'),
          style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: onJoin,
          icon: const Icon(Icons.lock_outline),
          label: const Text('Join operation'),
          style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
        ),
      ],
    );
  }
}

class _JoinStep extends StatelessWidget {
  const _JoinStep({
    required this.controller,
    required this.isLoading,
    required this.onSubmit,
  });

  final TextEditingController controller;
  final bool isLoading;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text('Enter access code', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        TextField(
          controller: controller,
          maxLength: 4,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(counterText: '', hintText: 'XXXX'),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: isLoading ? null : onSubmit,
          child: isLoading
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Access mainframe'),
        ),
      ],
    );
  }
}

class _LobbyStep extends StatelessWidget {
  const _LobbyStep({
    required this.code,
    required this.players,
    required this.isHost,
  });

  final String code;
  final List<String> players;
  final bool isHost;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 16),
        Text('Operation Code', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70)),
        const SizedBox(height: 6),
        Text(
          code.isEmpty ? '----' : code,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 18),
        Expanded(
          child: ListView.builder(
            itemCount: players.length + (players.length < 4 ? 1 : 0),
            itemBuilder: (ctx, index) {
              if (index < players.length) {
                final isFirst = index == 0;
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.white.withOpacity(0.1),
                    child: Text(players[index][0].toUpperCase()),
                  ),
                  title: Text(players[index]),
                  trailing: isFirst ? const Chip(label: Text('HOST')) : null,
                );
              }
              return const ListTile(
                leading: Icon(Icons.wifi_tethering, color: Colors.white54),
                title: Text('Waiting for agents...'),
              );
            },
          ),
        ),
        if (isHost)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: ElevatedButton(
              onPressed: players.length < 4
                  ? null
                  : () => ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Demo online lobby ready.')),
                      ),
              child: const Text('Start Mission'),
            ),
          ),
        const SizedBox(height: 12),
      ],
    );
  }
}
