import 'package:client_mobile/widgets/login_popup.dart';
import 'package:client_mobile/widgets/user_popup.dart';
import 'package:flutter/material.dart';

import '../widgets/chat_box.dart';
import '../widgets/menu_button.dart';
import './create_page.dart';
import './join_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final bool shouldShowLoginPopup = true;
  bool _didShowLoginPopup = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _maybeShowLoginPopup();
    });
  }

  void _maybeShowLoginPopup() {
    if (!mounted) return;
    if (shouldShowLoginPopup && !_didShowLoginPopup) {
      _didShowLoginPopup = true;
      _showLoginPopup();
    }
  }

  void _showLoginPopup() {
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return const LoginPopup();
      },
    );
  }

  void _showUserPopup() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) {
        return const UserPopup();
      },
    );
  }

  void _push(Widget page) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Align(
          alignment: Alignment.topLeft,
          child: FloatingActionButton(
            onPressed: _showUserPopup,
            child: const Icon(Icons.person),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.miniStartTop,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Row(
            children: [
              Expanded(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return SingleChildScrollView(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: constraints.maxHeight,
                        ),
                        child: IntrinsicHeight(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                'Pokeworld',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 48,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 2,
                                ),
                              ),
                              const SizedBox(height: 32),
                              MenuButton(
                                text: 'Rejoindre Partie',
                                color: Colors.lightBlue,
                                onPressed: () => _push(const JoinPage()),
                              ),
                              const SizedBox(height: 16),
                              MenuButton(
                                text: 'Créer Partie',
                                color: Colors.orange,
                                onPressed: () => _push(const CreatePage()),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 24),
              const Expanded(child: ChatBox()),
            ],
          ),
        ),
      ),
    );
  }
}
