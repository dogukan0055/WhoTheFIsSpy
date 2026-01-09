import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/spy_localizations.dart';
import '../models/game_models.dart';
import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GameController>(
      builder: (context, controller, _) {
        final app = controller.state.appSettings;
        final l10n = context.l10n;

        return SpyScaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: Text(l10n.text('systemConfig')),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              _SettingTile(
                title: l10n.text('soundEffects'),
                subtitle: l10n.text('uiBeeps'),
                value: app.sound,
                iconOn: Icons.volume_up,
                iconOff: Icons.volume_off,
                onChanged: () => controller.toggleAppSetting('sound'),
              ),
              _SettingTile(
                title: l10n.text('backgroundAmbience'),
                subtitle: l10n.text('atmosphericMusic'),
                value: app.music,
                iconOn: Icons.music_note,
                iconOff: Icons.music_off,
                onChanged: () => controller.toggleAppSetting('music'),
              ),
              _SettingTile(
                title: l10n.text('haptics'),
                subtitle: l10n.text('vibrate'),
                value: app.vibrate,
                iconOn: Icons.vibration,
                iconOff: Icons.phone_android_outlined,
                onChanged: () => controller.toggleAppSetting('vibrate'),
              ),
              _SettingTile(
                title: l10n.text('highContrast'),
                subtitle: l10n.text('highContrastDesc'),
                value: app.highContrast,
                iconOn: Icons.visibility,
                iconOff: Icons.visibility_off,
                onChanged: () => controller.toggleAppSetting('highContrast'),
              ),
              const SizedBox(height: 16),
              _LanguageTile(
                current: controller.state.language,
                onChanged: controller.setLanguage,
                label: l10n.text('language'),
                subtitle: l10n.text('languageSubtitle'),
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l10n.text('credits'),
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(l10n.text('designedBy')),
                      const SizedBox(height: 4),
                      Text(l10n.text('thanks')),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SettingTile extends StatelessWidget {
  const _SettingTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.iconOn,
    required this.iconOff,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final bool value;
  final IconData iconOn;
  final IconData iconOff;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(value ? iconOn : iconOff),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: Switch(value: value, onChanged: (_) => onChanged()),
      ),
    );
  }
}

class _LanguageTile extends StatelessWidget {
  const _LanguageTile({
    required this.current,
    required this.onChanged,
    required this.label,
    required this.subtitle,
  });

  final Language current;
  final ValueChanged<Language> onChanged;
  final String label;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Text(
          current == Language.tr ? '🇹🇷' : '🇺🇸',
          style: const TextStyle(fontSize: 24),
        ),
        title: Text(label),
        subtitle: Text(subtitle),
        trailing: ToggleButtons(
          borderRadius: BorderRadius.circular(10),
          isSelected: [
            current == Language.en,
            current == Language.tr,
          ],
          constraints: const BoxConstraints(minHeight: 40, minWidth: 52),
          onPressed: (index) {
            if (index == 0 && current != Language.en) {
              onChanged(Language.en);
            } else if (index == 1 && current != Language.tr) {
              onChanged(Language.tr);
            }
          },
          children: const [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 4),
              child: Text('EN'),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 4),
              child: Text('TR'),
            ),
          ],
        ),
      ),
    );
  }
}
