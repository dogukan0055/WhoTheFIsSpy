import 'package:flutter/material.dart';

import '../models/game_models.dart';
import 'offline_setup_page.dart';
import 'rules_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Who The F is Spy')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Party-friendly social deduction built for mobile.',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),
                Text(
                  'Host locally, pass a single device around, or be ready for upcoming online play.',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 36),
                FilledButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => const OfflineSetupPage(
                          initialConfiguration: GameConfiguration(
                            players: [
                              'Player 1',
                              'Player 2',
                              'Player 3',
                              'Player 4'
                            ],
                            spyCount: 1,
                            roundDuration: Duration(minutes: 8),
                          ),
                        ),
                      ),
                    );
                  },
                  child: const Text('Offline mode'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content:
                                Text('Online matchmaking is coming soon.')),
                      );
                    },
                    child: const Text('Online mode (coming soon)')),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                          builder: (context) => const RulesPage()),
                    );
                  },
                  child: const Text('View rules'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
