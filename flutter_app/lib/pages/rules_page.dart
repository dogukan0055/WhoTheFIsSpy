import 'package:flutter/material.dart';

class RulesPage extends StatelessWidget {
  const RulesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('How to play')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text('Overview', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          const Text(
            'One or more players are secretly spies. Everyone else knows the word prompt. Spies must bluff to blend in while they guess the prompt before time runs out.',
          ),
          const SizedBox(height: 16),
          Text('Flow', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          const Text('1. Add players, choose spy count, and start the round.'),
          const SizedBox(height: 4),
          const Text('2. Pass the device so each player can see their role and the prompt.'),
          const SizedBox(height: 4),
          const Text('3. Debate! When time is up, vote on who to eliminate and reveal spies.'),
          const SizedBox(height: 16),
          Text('Tips', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          const Text('• Keep prompts broad so spies need to probe for details.'),
          const Text('• Give the spy count a bump when you have 8+ players.'),
          const Text('• Try shorter timers for experienced groups to force quick reads.'),
        ],
      ),
    );
  }
}
