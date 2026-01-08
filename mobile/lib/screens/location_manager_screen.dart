import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/notifier.dart';
import '../widgets/spy_scaffold.dart';

class LocationManagerScreen extends StatefulWidget {
  const LocationManagerScreen({super.key});

  @override
  State<LocationManagerScreen> createState() => _LocationManagerScreenState();
}

class _LocationManagerScreenState extends State<LocationManagerScreen> {
  final Map<String, bool> _expanded = {};

  void _showInputDialog({
    required BuildContext context,
    required String title,
    required void Function(String) onSubmit,
    String? hint,
  }) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text(title),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(hintText: hint),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                onSubmit(controller.text.trim());
                Navigator.pop(ctx);
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, _) {
        final state = controller.state;
        final colorScheme = Theme.of(context).colorScheme;

        return SpyScaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: const Text('Location Database'),
            actions: [
              IconButton(
                icon: const Icon(Icons.add),
                tooltip: 'Add category',
                onPressed: () => _showInputDialog(
                  context: context,
                  title: 'New Category',
                  hint: 'Ex: Cafes',
                  onSubmit: (value) {
                    if (value.isEmpty) return;
                    controller.addCategory(value);
                  },
                ),
              ),
            ],
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              ...state.gameData.categories.map((cat) {
                final isSelected =
                    state.settings.selectedCategories.contains(cat.id);
                final isCore = initialCategories.any((c) => c.id == cat.id);
                final expanded = _expanded[cat.id] ?? false;
                final isEmpty = cat.locations.isEmpty;
                final activeLocations = cat.locations
                    .where((loc) => !cat.disabledLocations.contains(loc))
                    .length;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.02),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected
                          ? colorScheme.primary
                          : Colors.white.withValues(alpha: 0.08),
                      width: 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        title: Text(cat.name,
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(
                          'Active $activeLocations / ${cat.locations.length}',
                          style: const TextStyle(color: Colors.white70),
                        ),
                        leading: Checkbox(
                          value: isSelected,
                          onChanged: (_) {
                            if (isEmpty || activeLocations == 0) {
                              Notifier.show(context,
                                  'Add at least one active location first.',
                                  error: true);
                              return;
                            }
                            if (isSelected &&
                                state.settings.selectedCategories.length == 1) {
                              Notifier.show(context,
                                  'At least one category is required.',
                                  error: true);
                              return;
                            }
                            controller.toggleCategory(cat.id);
                          },
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(expanded
                                  ? Icons.expand_less
                                  : Icons.expand_more),
                              onPressed: () {
                                setState(() => _expanded[cat.id] = !expanded);
                              },
                            ),
                            if (!isCore)
                              IconButton(
                                icon: const Icon(Icons.delete_outline,
                                    color: Colors.redAccent),
                                onPressed: () =>
                                    controller.deleteCategory(cat.id),
                              ),
                          ],
                        ),
                      ),
                      if (expanded)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ...cat.locations.map((loc) {
                                final disabled =
                                    cat.disabledLocations.contains(loc);
                                final isCoreLoc = initialCategories.any(
                                    (orig) =>
                                        orig.id == cat.id &&
                                        orig.locations.contains(loc));
                                return Padding(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 4),
                                  child: Row(
                                    children: [
                                      Expanded(child: Text(loc)),
                                      Switch(
                                        value: !disabled,
                                        onChanged: (val) {
                                          controller.toggleLocation(
                                              cat.id, loc, val);
                                        },
                                      ),
                                      if (!isCoreLoc)
                                        IconButton(
                                          icon:
                                              const Icon(Icons.delete_outline),
                                          onPressed: () => controller
                                              .removeLocation(cat.id, loc),
                                        )
                                      else
                                        const Icon(Icons.lock_outline,
                                            size: 16, color: Colors.white54),
                                    ],
                                  ),
                                );
                              }),
                              if (!isCore)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: OutlinedButton.icon(
                                    onPressed: () => _showInputDialog(
                                      context: context,
                                      title: 'Add location to ${cat.name}',
                                      hint: 'Ex: Submarine base',
                                      onSubmit: (value) {
                                        if (value.isEmpty) return;
                                        controller.addLocation(cat.id, value);
                                      },
                                    ),
                                    icon: const Icon(
                                        Icons.add_location_alt_outlined),
                                    label: const Text('Add location'),
                                  ),
                                ),
                            ],
                          ),
                        ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
