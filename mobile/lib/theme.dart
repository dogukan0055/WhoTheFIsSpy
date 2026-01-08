import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

ThemeData buildSpyTheme({bool highContrast = false}) {
  final scheme = ColorScheme.dark(
    primary: const Color(0xFF22D3EE),
    secondary: const Color(0xFF8B5CF6),
    surface: highContrast ? const Color(0xFF0D0F1A) : const Color(0xFF0A0C14),
    background: highContrast ? const Color(0xFF0D0F1A) : const Color(0xFF05070E),
  );

  final textTheme = GoogleFonts.spaceGroteskTextTheme(
    const TextTheme(),
  ).copyWith(
    displaySmall: GoogleFonts.spaceMono(),
    displayMedium: GoogleFonts.spaceMono(),
    displayLarge: GoogleFonts.spaceMono(),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: scheme.background,
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      foregroundColor: scheme.onBackground,
      centerTitle: false,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: scheme.primary,
        foregroundColor: scheme.onPrimary,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: scheme.primary,
        side: BorderSide(color: scheme.primary.withOpacity(0.5)),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: scheme.surface.withOpacity(0.8),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: scheme.primary),
      ),
    ),
    cardTheme: CardThemeData(
      color: scheme.surface.withOpacity(0.9),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: scheme.primary,
      thumbColor: scheme.primary,
      inactiveTrackColor: Colors.white.withOpacity(0.15),
    ),
  );
}

const spyGradient = LinearGradient(
  colors: [
    Color(0xFF0F172A),
    Color(0xFF0B1223),
    Color(0xFF05070E),
  ],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);
