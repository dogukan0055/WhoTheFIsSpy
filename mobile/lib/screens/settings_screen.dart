import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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

        return SpyScaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: const Text('System Config'),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              _SettingTile(
                title: 'Sound Effects',
                subtitle: 'UI interaction beeps',
                value: app.sound,
                iconOn: Icons.volume_up,
                iconOff: Icons.volume_off,
                onChanged: () => controller.toggleAppSetting('sound'),
              ),
              _SettingTile(
                title: 'Background Ambience',
                subtitle: 'Atmospheric music',
                value: app.music,
                iconOn: Icons.music_note,
                iconOff: Icons.music_off,
                onChanged: () => controller.toggleAppSetting('music'),
              ),
              _SettingTile(
                title: 'Haptics',
                subtitle: 'Vibrate on actions',
                value: app.vibrate,
                iconOn: Icons.vibration,
                iconOff: Icons.phone_android_outlined,
                onChanged: () => controller.toggleAppSetting('vibrate'),
              ),
              _SettingTile(
                title: 'High Contrast',
                subtitle: 'More separation between layers',
                value: app.highContrast,
                iconOn: Icons.visibility,
                iconOff: Icons.visibility_off,
                onChanged: () => controller.toggleAppSetting('highContrast'),
              ),
              const SizedBox(height: 16),
              _LanguageTile(
                current: controller.state.language,
                onChanged: controller.setLanguage,
              ),
              const SizedBox(height: 24),
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Credits',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Text('Designed and developed by Doğukan Şıhman'),
                      SizedBox(height: 4),
                      Text('Special thanks to my lovely wife Deniz.'),
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
  const _LanguageTile({required this.current, required this.onChanged});

  final Language current;
  final ValueChanged<Language> onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Text(
          current == Language.tr ? '🇹🇷' : '🇺🇸',
          style: const TextStyle(fontSize: 24),
        ),
        title: const Text('Language'),
        subtitle: const Text('Türkçe / English'),
        trailing: DropdownButton<Language>(
          value: current,
          underline: const SizedBox(),
          items: const [
            DropdownMenuItem(
              value: Language.en,
              child: Text('English 🇺🇸'),
            ),
            DropdownMenuItem(
              value: Language.tr,
              child: Text('Türkçe 🇹🇷'),
            ),
          ],
          onChanged: (val) {
            if (val != null) onChanged(val);
          },
        ),
      ),
    );
  }
}
