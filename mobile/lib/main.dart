import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'screens/game_room_screen.dart';
import 'screens/home_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/location_manager_screen.dart';
import 'screens/offline_setup_screen.dart';
import 'screens/settings_screen.dart';
import 'state/game_controller.dart';
import 'theme.dart';
import 'models/game_models.dart';
import 'l10n/spy_localizations.dart';

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
            theme: buildSpyTheme(
              highContrast: state.appSettings.highContrast,
              mode: ThemeMode.light,
            ),
            darkTheme: buildSpyTheme(
              highContrast: state.appSettings.highContrast,
              mode: ThemeMode.dark,
            ),
            themeMode: state.themeMode,
            supportedLocales: const [
              Locale('en'),
              Locale('tr'),
            ],
            locale: state.language == Language.tr
                ? const Locale('tr')
                : const Locale('en'),
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
              SpyLocalizationsDelegate(),
            ],
            home: controller.hasSeenOnboarding
                ? const HomeScreen()
                : const OnboardingScreen(),
            routes: {
              '/home': (_) => const HomeScreen(),
              '/setup': (_) => const OfflineSetupScreen(),
              '/locations': (_) => const LocationManagerScreen(),
              '/game': (_) => const GameRoomScreen(),
              '/settings': (_) => const SettingsScreen(),
              '/onboarding': (_) => const OnboardingScreen(),
            },
          );
        },
      ),
    );
  }
}
