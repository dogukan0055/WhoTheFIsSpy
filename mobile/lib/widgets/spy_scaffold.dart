import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/game_controller.dart';
import '../theme.dart';

class SpyScaffold extends StatelessWidget {
  const SpyScaffold({
    super.key,
    required this.child,
    this.appBar,
    this.bottom,
    this.scrollable = true,
  });

  final PreferredSizeWidget? appBar;
  final Widget? bottom;
  final Widget child;
  final bool scrollable;

  @override
  Widget build(BuildContext context) {
    final highContrast = context.watch<GameController>().state.appSettings.highContrast;

    final isLight = Theme.of(context).brightness == Brightness.light;

    return Scaffold(
      appBar: appBar,
      extendBody: true,
      extendBodyBehindAppBar: true,
      bottomNavigationBar: bottom,
      body: Container(
        decoration: BoxDecoration(gradient: spyGradient(isLight)),
        child: Stack(
          children: [
            if (!highContrast)
              Positioned.fill(
                child: IgnorePointer(
                  ignoring: true,
                  child: CustomPaint(
                    painter: _GridPainter(),
                  ),
                ),
              ),
            if (!highContrast)
              Positioned(
                right: -60,
                top: -40,
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.blueAccent.withValues(alpha: 0.12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blueAccent.withValues(alpha: 0.2),
                        blurRadius: 90,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                ),
              ),
            if (!highContrast)
              Positioned(
                left: -40,
                bottom: -20,
                child: Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.purpleAccent.withValues(alpha: 0.12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.purpleAccent.withValues(alpha: 0.2),
                        blurRadius: 80,
                        spreadRadius: 8,
                      ),
                    ],
                  ),
                ),
              ),
            SafeArea(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 520),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    child: scrollable ? SingleChildScrollView(child: child) : child,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.04)
      ..strokeWidth = 0.5;
    const step = 28.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
