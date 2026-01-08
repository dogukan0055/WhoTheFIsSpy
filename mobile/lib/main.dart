import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/game_room_screen.dart';
import 'screens/home_screen.dart';
import 'screens/location_manager_screen.dart';
import 'screens/offline_setup_screen.dart';
import 'screens/online_menu_screen.dart';
import 'screens/settings_screen.dart';
import 'state/game_controller.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SpyApp());
}

class SpyApp extends StatelessWidget {
  const SpyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => GameController(),
      child: Consumer<GameController>(
        builder: (context, controller, _) {
          final state = controller.state;
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'Who The F Is Spy?',
            theme: buildSpyTheme(highContrast: state.appSettings.highContrast),
            initialRoute: '/',
            routes: {
              '/': (_) => const HomeScreen(),
              '/setup': (_) => const OfflineSetupScreen(),
              '/locations': (_) => const LocationManagerScreen(),
              '/game': (_) => const GameRoomScreen(),
              '/online': (_) => const OnlineMenuScreen(),
              '/settings': (_) => const SettingsScreen(),
            },
          );
        },
      ),
    );
  }
}
