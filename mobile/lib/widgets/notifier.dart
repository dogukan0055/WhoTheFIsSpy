import 'dart:async';

import 'package:flutter/material.dart';

class Notifier {
  static String? _lastMessage;
  static OverlayEntry? _entry;
  static Timer? _timer;

  static void show(
    BuildContext context,
    String message, {
    bool error = false,
    bool warning = false,
  }) {
    if (_lastMessage == message) return;
    _lastMessage = message;
    _timer?.cancel();
    _entry?.remove();

    final overlay = Overlay.of(context);

    final background = error
        ? Colors.redAccent
        : warning
            ? Colors.orangeAccent.withValues(alpha: 0.9)
            : Colors.greenAccent.withValues(alpha: 0.9);

    _entry = OverlayEntry(
      builder: (_) => _NotifierToast(
        message: message,
        background: background,
        onClose: _clear,
      ),
    );
    overlay.insert(_entry!);
  }

  static void _clear() {
    _timer?.cancel();
    _timer = null;
    _entry?.remove();
    _entry = null;
    _lastMessage = null;
  }
}

class _NotifierToast extends StatefulWidget {
  const _NotifierToast({
    required this.message,
    required this.background,
    required this.onClose,
  });

  final String message;
  final Color background;
  final VoidCallback onClose;

  @override
  State<_NotifierToast> createState() => _NotifierToastState();
}

class _NotifierToastState extends State<_NotifierToast> {
  bool _visible = false;
  Timer? _autoClose;

  @override
  void initState() {
    super.initState();
    // Trigger fade-in on next microtask
    Future.microtask(() => setState(() => _visible = true));
    _autoClose = Timer(const Duration(seconds: 3), _hide);
  }

  @override
  void dispose() {
    _autoClose?.cancel();
    super.dispose();
  }

  void _hide() {
    if (!_visible) {
      widget.onClose();
      return;
    }
    setState(() => _visible = false);
    Future.delayed(const Duration(milliseconds: 500), widget.onClose);
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 16,
      right: 16,
      bottom: 24,
      child: SafeArea(
        child: Dismissible(
          key: const ValueKey('notifier-toast'),
          direction: DismissDirection.horizontal,
          onDismissed: (_) => _hide(),
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 500),
            opacity: _visible ? 1 : 0,
            child: Material(
              elevation: 4,
              borderRadius: BorderRadius.circular(14),
              color: widget.background,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Expanded(child: Text(widget.message)),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: _hide,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
