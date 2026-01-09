import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
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
  late List<Category> _categories;
  late List<String> _selectedCategories;

  void _confirmDelete({
    required BuildContext context,
    required String target,
    required String message,
    required VoidCallback onConfirm,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: AlertDialog(
          title: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text(context.l10n.text('cancel')),
            ),
            ElevatedButton(
              onPressed: () {
                onConfirm();
                Navigator.of(ctx).pop();
              },
              child: Text(context.l10n.text('yes')),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    final state = context.read<GameController>().state;
    _categories = state.gameData.categories
        .map(
          (c) => c.copyWith(
            locations: List<String>.from(c.locations),
            disabledLocations: List<String>.from(c.disabledLocations),
          ),
        )
        .toList();
    _selectedCategories = List<String>.from(state.settings.selectedCategories);
  }

  void _showInputDialog({
    required BuildContext context,
    required String title,
    required void Function(String) onSubmit,
    String? hint,
  }) {
    final l10n = context.l10n;
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
          child: AlertDialog(
            title: Text(title),
            content: TextField(
              controller: controller,
              textCapitalization: TextCapitalization.words,
              maxLength: 16,
              decoration: InputDecoration(hintText: hint),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(l10n.text('cancel')),
              ),
              ElevatedButton(
                onPressed: () {
                  onSubmit(controller.text.trim());
                  Navigator.pop(ctx);
                },
                child: Text(l10n.text('save')),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, _) {
        final colorScheme = Theme.of(context).colorScheme;
        final l10n = context.l10n;

        return SpyScaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                context.read<GameController>().playClick();
                Navigator.of(context).pop();
              },
            ),
            title: Text(l10n.text('locationDb')),
            actions: [
              IconButton(
                icon: const Icon(Icons.add),
                tooltip: l10n.text('addCategory'),
                onPressed: () {
                  controller.playClick();
                  _showInputDialog(
                    context: context,
                    title: l10n.text('newCategory'),
                    hint: l10n.text('categoryHint'),
                    onSubmit: (value) {
                      if (value.isEmpty) return;
                      if (value.length > 16) {
                        Notifier.show(context, l10n.text('max16'),
                            warning: true);
                        return;
                      }
                      final id = value
                          .toLowerCase()
                          .replaceAll(RegExp(r'[^a-z0-9]+'), '-');
                      setState(() {
                        _categories.add(Category(
                          id: id,
                          name: value,
                          icon: 'Folder',
                          locations: [],
                          disabledLocations: const [],
                        ));
                        _expanded[id] = true;
                      });
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        Notifier.show(
                            context,
                            l10n.text('addedCategory').replaceAll('{name}', value));
                      });
                    },
                  );
                },
              ),
            ],
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    l10n.text('customCategoryHint'),
                    style: Theme.of(context)
                        .textTheme
                        .titleSmall
                        ?.copyWith(
                            fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              ..._categories.map((cat) {
                final isSelected = _selectedCategories.contains(cat.id);
                final isCore = initialCategories.any((c) => c.id == cat.id);
                final expanded = _expanded[cat.id] ?? false;
                final isEmpty = cat.locations.isEmpty;
                final activeLocations = cat.locations
                    .where((loc) => !cat.disabledLocations.contains(loc))
                    .length;

                final isPartial =
                    activeLocations > 0 && activeLocations < cat.locations.length;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.02),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isPartial
                          ? Colors.orangeAccent
                          : isSelected
                              ? colorScheme.primary
                              : Colors.white.withValues(alpha: 0.08),
                      width: isPartial ? 2 : 1.5,
                    ),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        title: Row(
                          mainAxisSize: MainAxisSize.min,
                        children: [
                            if (!isCore) ...[
                              Icon(Icons.star_rounded,
                                  size: 16,
                                  color:
                                      Colors.amberAccent.withValues(alpha: 0.9)),
                              const SizedBox(width: 6),
                            ],
                            Text(l10n.categoryName(cat.name),
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                        subtitle: Text(
                          l10n.activeCount(
                              activeLocations, cat.locations.length),
                          style: const TextStyle(color: Colors.white70),
                        ),
                        leading: Checkbox(
                          checkColor: Colors.white,
                          activeColor: isPartial
                              ? Colors.orangeAccent
                              : colorScheme.primary,
                          value: isSelected,
                          onChanged: (_) {
                            controller.playClick();
                            if (isEmpty) {
                              Notifier.show(
                                  context, l10n.text('needActiveLocation'),
                                  error: true);
                              return;
                            }
                            if (isSelected && _selectedCategories.length <= 1) {
                              Notifier.show(context, l10n.text('needCategory'),
                                  error: true);
                              return;
                            }
                            setState(() {
                              if (isSelected) {
                                _selectedCategories.remove(cat.id);
                                final idx = _categories
                                    .indexWhere((c) => c.id == cat.id);
                                if (idx != -1) {
                                  _categories[idx] = _categories[idx].copyWith(
                                      disabledLocations:
                                          List<String>.from(cat.locations));
                                }
                              } else {
                                _selectedCategories.add(cat.id);
                                final idx = _categories
                                    .indexWhere((c) => c.id == cat.id);
                                if (idx != -1) {
                                  _categories[idx] = _categories[idx].copyWith(
                                      disabledLocations: const []);
                                }
                              }
                            });
                          },
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(
                                  expanded ? Icons.expand_less : Icons.expand_more),
                              onPressed: () {
                                controller.playClick();
                                setState(() => _expanded[cat.id] = !expanded);
                              },
                            ),
                           if (!isCore)
                             IconButton(
                               icon: const Icon(Icons.edit),
                               onPressed: () {
                                 controller.playClick();
                                 _showInputDialog(
                                   context: context,
                                   title: l10n.text('renameCategory'),
                                   hint: cat.name,
                                   onSubmit: (value) {
                                     if (value.isEmpty || value.length > 16) {
                                       Notifier.show(
                                           context, l10n.text('max16'),
                                           warning: true);
                                       return;
                                     }
                                     setState(() {
                                       final idx = _categories.indexWhere(
                                           (element) => element.id == cat.id);
                                       if (idx != -1) {
                                         _categories[idx] = _categories[idx]
                                             .copyWith(name: value);
                                       }
                                     });
                                     WidgetsBinding.instance
                                         .addPostFrameCallback((_) {
                                       Notifier.show(
                                           context,
                                            l10n
                                                .text('categoryRenamed')
                                                .replaceAll('{name}', value));
                                     });
                                   },
                                 );
                               },
                             ),
                            if (!isCore)
                              IconButton(
                                icon: const Icon(Icons.delete_outline,
                                    color: Colors.redAccent),
                                onPressed: () {
                                  controller.playClick();
                                  _confirmDelete(
                                    context: context,
                                    target: cat.name,
                                    message: l10n
                                        .text('confirmDeleteCategory')
                                        .replaceAll('{name}', cat.name),
                                    onConfirm: () {
                                      setState(() {
                                        _categories.removeWhere(
                                            (existing) => existing.id == cat.id);
                                        _selectedCategories.remove(cat.id);
                                      });
                                      WidgetsBinding.instance
                                          .addPostFrameCallback((_) {
                                        Notifier.show(
                                            context,
                                            l10n
                                                .text('deletedCategory')
                                                .replaceAll('{name}', cat.name));
                                      });
                                    },
                                  );
                                },
                              ),
                          ],
                        ),
                        onTap: () {
                          controller.playClick();
                          setState(() => _expanded[cat.id] = !expanded);
                        },
                      ),
                      if (expanded)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: cat.locations.map((loc) {
                                  final disabled =
                                      cat.disabledLocations.contains(loc);
                                  final activeColor = isPartial
                                      ? Colors.orangeAccent
                                      : Theme.of(context).colorScheme.primary;
                                  return GestureDetector(
                                    onLongPress: !isCore
                                        ? () {
                                            controller.playClick();
                                            _showInputDialog(
                                              context: context,
                                              title: l10n
                                                  .text('renameLocation'),
                                              hint: loc,
                                              onSubmit: (value) {
                                                if (value.isEmpty ||
                                                    value.length > 16) {
                                                  Notifier.show(
                                                      context, l10n.text('max16'),
                                                      warning: true);
                                                  return;
                                                }
                                                setState(() {
                                                  final catIndex =
                                                      _categories.indexWhere(
                                                          (element) =>
                                                              element.id ==
                                                              cat.id);
                                                  if (catIndex == -1) return;
                                                  final newLocs = List<String>.from(
                                                      _categories[catIndex]
                                                          .locations);
                                                  final locIndex =
                                                      newLocs.indexOf(loc);
                                                  if (locIndex != -1) {
                                                    newLocs[locIndex] = value;
                                                    final newDisabled =
                                                        List<String>.from(
                                                            _categories[
                                                                    catIndex]
                                                                .disabledLocations);
                                                    final disabledIdx =
                                                        newDisabled.indexOf(loc);
                                                    if (disabledIdx != -1) {
                                                      newDisabled[disabledIdx] =
                                                          value;
                                                    }
                                                    _categories[catIndex] =
                                                        _categories[catIndex]
                                                            .copyWith(
                                                                locations:
                                                                    newLocs,
                                                                disabledLocations:
                                                                    newDisabled);
                                                  }
                                                });
                                                WidgetsBinding.instance
                                                    .addPostFrameCallback((_) {
                                                  Notifier.show(
                                                      context,
                                                      l10n
                                                          .text('renameSuccess')
                                                          .replaceAll(
                                                              '{name}', value));
                                                });
                                              },
                                            );
                                          }
                                        : null,
                                    onTap: () {
                                      controller.playClick();
                                      setState(() {
                                        final catIndex = _categories.indexWhere(
                                            (element) => element.id == cat.id);
                                        if (catIndex == -1) return;
                                        final disabledList = List<String>.from(
                                            _categories[catIndex]
                                                .disabledLocations);
                                        if (!disabled) {
                                          disabledList.add(loc);
                                        } else {
                                          disabledList.remove(loc);
                                        }
                                        var updatedCat = _categories[catIndex]
                                            .copyWith(
                                                disabledLocations:
                                                    disabledList);
                                        final activeCount = updatedCat.locations
                                            .where((l) => !updatedCat
                                                .disabledLocations
                                                .contains(l))
                                            .length;
                                        if (activeCount == 0) {
                                          _selectedCategories
                                              .remove(updatedCat.id);
                                        } else {
                                          if (!_selectedCategories
                                              .contains(updatedCat.id)) {
                                            _selectedCategories
                                                .add(updatedCat.id);
                                          }
                                      }
                                      _categories[catIndex] = updatedCat;
                                    });
                                  },
                                    onDoubleTap: !isCore
                                        ? () {
                                            controller.playClick();
                                            _confirmDelete(
                                              context: context,
                                              target: loc,
                                              message: l10n
                                                  .text('confirmDeleteLocation')
                                                  .replaceAll('{name}', loc),
                                              onConfirm: () {
                                                setState(() {
                                                  final catIndex =
                                                      _categories.indexWhere(
                                                          (element) =>
                                                              element.id ==
                                                              cat.id);
                                                  if (catIndex == -1) return;
                                                  final newLocs = List<String>.from(
                                                      _categories[catIndex]
                                                          .locations)
                                                    ..remove(loc);
                                                  final newDisabled = List<String>.from(
                                                      _categories[catIndex]
                                                          .disabledLocations)
                                                    ..remove(loc);
                                                  var updatedCat =
                                                      _categories[catIndex]
                                                          .copyWith(
                                                              locations:
                                                                  newLocs,
                                                              disabledLocations:
                                                                  newDisabled);
                                                  final activeCount =
                                                      updatedCat.locations
                                                          .where((l) =>
                                                              !updatedCat
                                                                  .disabledLocations
                                                                  .contains(l))
                                                          .length;
                                                  if (activeCount == 0) {
                                                    _selectedCategories
                                                        .remove(updatedCat.id);
                                                  }
                                                  _categories[catIndex] =
                                                      updatedCat;
                                                });
                                                WidgetsBinding.instance
                                                    .addPostFrameCallback((_) {
                                                  Notifier.show(
                                                      context,
                                                      l10n
                                                          .text('deleteSuccess')
                                                          .replaceAll(
                                                              '{name}', loc));
                                                });
                                              },
                                            );
                                          }
                                        : null,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: disabled
                                            ? Colors.white
                                                .withValues(alpha: 0.08)
                                            : activeColor
                                                .withValues(alpha: 0.18),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: disabled
                                              ? Colors.white
                                                  .withValues(alpha: 0.2)
                                              : activeColor
                                                  .withValues(alpha: 0.5),
                                        ),
                                      ),
                                      child: Text(
                                        l10n.locationName(loc),
                                        style: TextStyle(
                                          color: disabled
                                              ? Colors.white70
                                              : Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                              if (!isCore)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: OutlinedButton.icon(
                                    onPressed: () {
                                      controller.playClick();
                                      _showInputDialog(
                                        context: context,
                                        title: l10n.addLocationTo(cat.name),
                                        hint: l10n.text('locationHint'),
                                        onSubmit: (value) {
                                          if (value.isEmpty) return;
                                          if (value.length > 16) {
                                            Notifier.show(
                                              context,
                                              l10n.text('max16'),
                                              warning: true,
                                            );
                                            return;
                                          }
                                          setState(() {
                                            final catIndex =
                                                _categories.indexWhere(
                                                    (element) =>
                                                        element.id == cat.id);
                                            if (catIndex == -1) return;
                                            final newLocs = List<String>.from(
                                                _categories[catIndex].locations);
                                            newLocs.add(value);
                                            _categories[catIndex] =
                                                _categories[catIndex].copyWith(
                                                    locations: newLocs);
                                          });
                                          WidgetsBinding.instance
                                              .addPostFrameCallback((_) {
                                            Notifier.show(
                                              context,
                                              l10n
                                                  .text('addedLocationTo')
                                                  .replaceAll('{loc}', value)
                                                  .replaceAll(
                                                      '{cat}',
                                                      l10n
                                                          .categoryName(cat.name)),
                                            );
                                          });
                                        },
                                      );
                                    },
                                    icon: const Icon(
                                        Icons.add_location_alt_outlined),
                                    label: Text(l10n.text('addLocation')),
                                  ),
                                ),
                            ],
                          ),
                        ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: ElevatedButton.icon(
                  onPressed: () {
                    controller.playClick();
                    controller.updateLocations(
                        categories: _categories,
                        selectedCategories: _selectedCategories);
                    Notifier.show(context, l10n.text('locationsSaved'));
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.save_outlined),
                  label: Text(l10n.text('save')),
                  style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(50)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  l10n.text('editHint'),
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Colors.white70),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
