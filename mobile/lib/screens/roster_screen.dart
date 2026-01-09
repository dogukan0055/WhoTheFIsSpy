import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
import '../models/game_models.dart';
import '../state/game_controller.dart';
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
    final l10n = context.l10n;
    context.read<GameController>().playClick();
    final names = _controllers.map((c) => c.text.trim()).toList();
    for (final name in names) {
      if (name.isEmpty) {
        Notifier.show(context, l10n.text('codeNameRequired'), error: true);
        return;
      }
      if (name.length > 16) {
        Notifier.show(context, l10n.text('maxNameLength'), error: true);
        return;
      }
      if (!RegExp(r'^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$').hasMatch(name)) {
        Notifier.show(context, l10n.text('lettersOnly'), error: true);
        return;
      }
      if (containsProfanity(name)) {
        Notifier.show(context, l10n.nameNotAllowed(name), error: true);
        return;
      }
    }
    final unique = names.toSet();
    if (unique.length != names.length) {
      Notifier.show(context, l10n.text('noDuplicates'), error: true);
      return;
    }

    Navigator.of(context).pop(names);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(context.l10n.text('agentRoster')),
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
                hintText: context.l10n.agentHint(index),
              ),
              onChanged: (_) => setState(() {}),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _save,
        icon: const Icon(Icons.check),
        label: Text(context.l10n.text('saveRoster')),
      ),
    );
  }
}
