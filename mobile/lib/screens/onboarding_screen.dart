import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/game_controller.dart';
import '../widgets/spy_scaffold.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const pages = [
      _OnboardPage(
        title: 'Welcome, Agent',
        body: 'A spy hides among you. Keep your answers vague, but sharp.',
      ),
      _OnboardPage(
        title: 'Reveal in Secret',
        body: 'Pass the device and scan to reveal your identity. No peeking.',
      ),
      _OnboardPage(
        title: 'Interrogate & Vote',
        body: 'Ask pointed questions, call a vote, and catch the impostor.',
      ),
    ];

    return const SpyScaffold(
      scrollable: false,
      child: _Pager(pages: pages),
    );
  }
}

class _Pager extends StatefulWidget {
  const _Pager({required this.pages});
  final List<_OnboardPage> pages;

  @override
  State<_Pager> createState() => _PagerState();
}

class _PagerState extends State<_Pager> {
  final controller = PageController();
  int index = 0;

  void _finish(BuildContext context) {
    context.read<GameController>().markOnboardingSeen();
    Navigator.of(context).pushReplacementNamed('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Align(
          alignment: Alignment.topRight,
          child: index < widget.pages.length - 1
              ? TextButton(
                  onPressed: () => _finish(context),
                  child: const Text('Skip'),
                )
              : const SizedBox.shrink(),
        ),
        Expanded(
          child: PageView(
            controller: controller,
            onPageChanged: (i) => setState(() => index = i),
            children: widget.pages,
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            widget.pages.length,
            (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
              width: i == index ? 24 : 10,
              height: 6,
              decoration: BoxDecoration(
                color: Theme.of(context)
                    .colorScheme
                    .primary
                    .withValues(alpha: i == index ? 0.9 : 0.4),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 24),
          child: ElevatedButton(
            onPressed: () {
              if (index == widget.pages.length - 1) {
                _finish(context);
              } else {
                controller.nextPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeOut);
              }
            },
            child: Text(
                index == widget.pages.length - 1 ? 'Enter Mission' : 'Next'),
          ),
        ),
      ],
    );
  }
}

class _OnboardPage extends StatelessWidget {
  const _OnboardPage({required this.title, required this.body});
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.shield_moon,
                size: 72, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 20),
            Text(
              title,
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              body,
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
