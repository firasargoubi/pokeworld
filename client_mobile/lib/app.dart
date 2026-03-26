import 'package:flutter/material.dart';

import 'models/popup_message.dart';
import 'models/user_preferences.dart';
import 'pages/home_page/home_page.dart';
import 'services/navigation_service/navigation_service.dart';
import 'services/popup_service/popup_service.dart';
import 'services/preferences_service/preferences_service.dart';
import 'services/user_service/user_service.dart';
import 'widgets/user_login_popup/user_login_popup.dart';
import 'widgets/warning_confirmation_popup/warning_confirmation_popup.dart';

class PokeWorldApp extends StatefulWidget {
  const PokeWorldApp({super.key});

  @override
  State<PokeWorldApp> createState() => _PokeWorldAppState();
}

class _PokeWorldAppState extends State<PokeWorldApp> {
  final PopupService _popupService = PopupService();
  final PreferencesService _preferencesService = PreferencesService();
  final UserService _userService = UserService();

  bool _wasLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _wasLoggedIn = _userService.currentUser.value != null;
    _userService.currentUser.addListener(_onUserChanged);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_userService.currentUser.value == null) {
        _showLoginPopup();
      }
    });
  }

  @override
  void dispose() {
    _userService.currentUser.removeListener(_onUserChanged);
    super.dispose();
  }

  void _onUserChanged() {
    final bool isLoggedIn = _userService.currentUser.value != null;

    if (_wasLoggedIn && !isLoggedIn) {
      final navigator = NavigationService.navigatorKey.currentState;
      if (navigator != null) {
        navigator.popUntil((route) => route.isFirst);

        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showLoginPopup();
        });
      }
    }

    _wasLoggedIn = isLoggedIn;
  }

  void _showLoginPopup() {
    final context = NavigationService.navigatorKey.currentState?.context;
    if (context != null && context.mounted) {
      showUserLoginPopup(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_preferencesService.currentLanguage, _preferencesService.currentTheme]),
      builder: (_, _) {
        final currentLanguage = _preferencesService.currentLanguage.value;
        final currentTheme = _preferencesService.currentTheme.value;

        return MaterialApp(
          key: ValueKey<String>('${currentLanguage.code}-${currentTheme.code}'),
          navigatorKey: NavigationService.navigatorKey,
          debugShowCheckedModeBanner: false,
          title: 'PokeWorld',
          locale: _preferencesService.currentLocale,
          theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.green), useMaterial3: true),
          builder: (context, child) {
            final content = Stack(
              children: [
                if (child != null) child,
                ValueListenableBuilder<List<PopupMessage>>(
                  valueListenable: _popupService.activePopups,
                  builder: (_, popups, _) {
                    if (popups.isEmpty) {
                      return const SizedBox.shrink();
                    }

                    final popup = popups.last;
                    return WarningConfirmationPopup(
                      message: popup.message,
                      hasCloseButton: popup.hasCloseButton,
                      isConfirmation: popup.isConfirmation,
                      popupColor: popup.popupColor,
                      onClosed: (confirmed) {
                        _popupService.handlePopupClose(message: popup, confirmed: confirmed);
                      },
                    );
                  },
                ),
              ],
            );

            if (_preferencesService.currentTheme.value != AppTheme.Dark) {
              return content;
            }

            return ColorFiltered(
              colorFilter: const ColorFilter.matrix(<double>[
                -0.525,
                1.543,
                -0.018,
                0,
                0,
                0.398,
                0.410,
                0.192,
                0,
                0,
                0.559,
                1.295,
                -0.854,
                0,
                0,
                0,
                0,
                0,
                1,
                0,
              ]),
              child: ColorFiltered(
                colorFilter: const ColorFilter.matrix(<double>[
                  0.9213,
                  0.0715,
                  0.0072,
                  0,
                  0,
                  0.0213,
                  0.9715,
                  0.0072,
                  0,
                  0,
                  0.0213,
                  0.0715,
                  0.9072,
                  0,
                  0,
                  0,
                  0,
                  0,
                  1,
                  0,
                ]),
                child: ColorFiltered(
                  colorFilter: const ColorFilter.matrix(<double>[1.2, 0, 0, 0, -25.5, 0, 1.2, 0, 0, -25.5, 0, 0, 1.2, 0, -25.5, 0, 0, 0, 1, 0]),
                  child: ColorFiltered(
                    colorFilter: const ColorFilter.matrix(<double>[0.85, 0, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0, 1, 0]),
                    child: content,
                  ),
                ),
              ),
            );
          },
          home: HomePage(key: ValueKey<String>('home-${currentLanguage.code}')),
        );
      },
    );
  }
}
