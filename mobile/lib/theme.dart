import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

ThemeData buildSpyTheme(
    {bool highContrast = false, ThemeMode mode = ThemeMode.dark}) {
  final isLight = mode == ThemeMode.light;
  final scheme =
      (isLight ? const ColorScheme.light() : const ColorScheme.dark()).copyWith(
    primary: const Color(0xFF22D3EE),
    secondary: const Color(0xFF8B5CF6),
    surface: isLight
        ? const Color(0xFFF6F7FB)
        : highContrast
            ? const Color(0xFF0D0F1A)
            : const Color(0xFF0A0C14),
  );

  final textTheme = GoogleFonts.spaceGroteskTextTheme(
    const TextTheme(),
  )
      .copyWith(
        displaySmall: GoogleFonts.spaceMono(),
        displayMedium: GoogleFonts.spaceMono(),
        displayLarge: GoogleFonts.spaceMono(),
      )
      .apply(
        bodyColor: isLight ? Colors.black87 : Colors.white,
        displayColor: isLight ? Colors.black87 : Colors.white,
      );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: scheme.surface,
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      foregroundColor: scheme.onSurface,
      centerTitle: false,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: scheme.primary,
        foregroundColor: scheme.onPrimary,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle:
            const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: scheme.primary,
        side: BorderSide(color: scheme.primary.withValues(alpha: 0.5)),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: scheme.surface.withValues(alpha: 0.8),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: scheme.primary),
      ),
    ),
    cardTheme: CardThemeData(
      color: scheme.surface.withValues(alpha: 0.9),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: scheme.primary,
      thumbColor: scheme.primary,
      inactiveTrackColor: Colors.white.withValues(alpha: 0.15),
    ),
  );
}

LinearGradient spyGradient(bool isLight) {
  return LinearGradient(
    colors: isLight
        ? const [
            Color(0xFFEFF4FF),
            Color(0xFFDCE6FF),
            Color(0xFFC8D7F5),
          ]
        : const [
            Color(0xFF0F172A),
            Color(0xFF0B1223),
            Color(0xFF05070E),
          ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
