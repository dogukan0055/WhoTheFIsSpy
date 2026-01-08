import 'package:flutter/material.dart';

import '../models/game_models.dart';
import '../widgets/notifier.dart';

class AgentRosterScreen extends StatefulWidget {
  const AgentRosterScreen({super.key, required this.initialNames});

  final List<String> initialNames;

  @override
  State<AgentRosterScreen> createState() => _AgentRosterScreenState();
}

class _AgentRosterScreenState extends State<AgentRosterScreen> {
  late final List<TextEditingController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers =
        widget.initialNames.map((n) => TextEditingController(text: n)).toList();
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _save() {
    final names = _controllers.map((c) => c.text.trim()).toList();
    for (final name in names) {
      if (name.isEmpty) {
        Notifier.show(context, 'All players need a codename.', error: true);
        return;
      }
      if (name.length > 16) {
        Notifier.show(context, 'Max 16 characters per name.', error: true);
        return;
      }
      if (!RegExp(r'^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$').hasMatch(name)) {
        Notifier.show(context, 'Names can only contain letters and spaces.',
            error: true);
        return;
      }
      if (containsProfanity(name)) {
        Notifier.show(context, '"$name" is not allowed.', error: true);
        return;
      }
    }
    final unique = names.toSet();
    if (unique.length != names.length) {
      Notifier.show(context, 'Duplicate names are not allowed.', error: true);
      return;
    }

    Navigator.of(context).pop(names);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agent Roster'),
        actions: [
          TextButton(
            onPressed: _save,
            child: const Text('Save'),
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _controllers.length,
        itemBuilder: (_, index) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: TextField(
              controller: _controllers[index],
              maxLength: 16,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                counterText: '${_controllers[index].text.length}/16',
                prefixIcon: CircleAvatar(
                  radius: 14,
                  backgroundColor: Colors.white.withValues(alpha: 0.1),
                  child: Text('${index + 1}'),
                ),
                hintText: 'Agent ${index + 1}',
              ),
              onChanged: (_) => setState(() {}),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _save,
        icon: const Icon(Icons.check),
        label: const Text('Save Roster'),
      ),
    );
  }
}
