import 'package:flutter/material.dart';

class Notifier {
  static String? _lastMessage;

  static void show(BuildContext context, String message, {bool error = false}) {
    if (_lastMessage == message) return;
    _lastMessage = message;
    final messenger = ScaffoldMessenger.of(context);
    messenger.clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Expanded(child: Text(message)),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: () => messenger.hideCurrentSnackBar(),
            ),
          ],
        ),
        backgroundColor: error ? Colors.redAccent : null,
        behavior: SnackBarBehavior.floating,
        dismissDirection: DismissDirection.horizontal,
      ),
    ).closed.then((_) => _lastMessage = null);
  }
}
