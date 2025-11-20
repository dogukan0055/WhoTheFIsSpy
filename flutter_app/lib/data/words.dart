import 'dart:math';

class WordPrompt {
  final String topic;
  final String hint;

  const WordPrompt({required this.topic, required this.hint});
}

class WordBank {
  static const _prompts = <WordPrompt>[
    WordPrompt(topic: 'Airport', hint: 'Check your boarding gate and baggage claim.'),
    WordPrompt(topic: 'Beach', hint: 'Waves, sand, and sunscreen everywhere.'),
    WordPrompt(topic: 'Theatre', hint: 'Lights, curtains, applause, and hushed whispers.'),
    WordPrompt(topic: 'Restaurant', hint: 'Menus, servers, and a kitchen buzzing with orders.'),
    WordPrompt(topic: 'Hospital', hint: 'White coats, beeping monitors, and waiting rooms.'),
    WordPrompt(topic: 'Library', hint: 'Quiet stacks, study tables, and reserved whispers.'),
    WordPrompt(topic: 'Concert', hint: 'A loud stage, a crowd, and merch stands.'),
    WordPrompt(topic: 'Museum', hint: 'Exhibits behind glass and guided tours nearby.'),
  ];

  const WordBank();

  WordPrompt draw(Random random) {
    return _prompts[random.nextInt(_prompts.length)];
  }
}
