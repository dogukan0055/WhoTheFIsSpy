import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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
                icon: Icons.volume_up_outlined,
                onChanged: () => controller.toggleAppSetting('sound'),
              ),
              _SettingTile(
                title: 'Background Ambience',
                subtitle: 'Atmospheric music',
                value: app.music,
                icon: Icons.music_note,
                onChanged: () => controller.toggleAppSetting('music'),
              ),
              _SettingTile(
                title: 'Haptics',
                subtitle: 'Vibrate on actions',
                value: app.vibrate,
                icon: Icons.vibration,
                onChanged: () => controller.toggleAppSetting('vibrate'),
              ),
              _SettingTile(
                title: 'High Contrast',
                subtitle: 'More separation between layers',
                value: app.highContrast,
                icon: Icons.visibility,
                onChanged: () => controller.toggleAppSetting('highContrast'),
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Credits', style: TextStyle(fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Text('Designed and developed by Doğukan Şıhman'),
                      SizedBox(height: 4),
                      Text('Special thanks to Deniz.'),
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
    required this.icon,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final bool value;
  final IconData icon;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: Switch(value: value, onChanged: (_) => onChanged()),
      ),
    );
  }
}
