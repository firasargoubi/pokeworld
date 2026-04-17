import 'dart:ui';

import 'package:client_mobile/consts/popup_messages_const.dart';
import 'package:flutter/material.dart';

import 'models/popup_message.dart';
import 'models/user_preferences.dart';
import 'pages/home_page/home_page.dart';
import 'services/audio_service/audio_service.dart';
import 'services/match_service/match_service.dart';
import 'services/navigation_service/navigation_service.dart';
import 'services/notification_service/notification_service.dart';
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

class _PokeWorldAppState extends State<PokeWorldApp> with WidgetsBindingObserver {
  final PopupService _popupService = PopupService();
  final PreferencesService _preferencesService = PreferencesService();
  final UserService _userService = UserService();
  final AudioService _audioService = AudioService();
  final NotificationService _notificationService = NotificationService();

  bool _wasLoggedIn = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
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
    WidgetsBinding.instance.removeObserver(this);
    _userService.currentUser.removeListener(_onUserChanged);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _notificationService.setAppInBackground(false);
        _notificationService.clearSystemNotifications();
        _audioService.resumeBackgroundMusicForMatchState(MatchService().matchData?.state);
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.paused:
      case AppLifecycleState.hidden:
      case AppLifecycleState.detached:
        _notificationService.setAppInBackground(true);
        _audioService.stopAllAudio();
        break;
    }
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
    final nav = NavigationService.navigatorKey.currentState;
    if (nav == null) return;

    nav.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const HomePage()),
      (r) => false,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final context = NavigationService.navigatorKey.currentState?.context;
      if (context == null || !context.mounted) return;
      showUserLoginPopup(context).whenComplete(() {
        if (_userService.currentUser.value == null) return;
        final navAfter = NavigationService.navigatorKey.currentState;
        navAfter?.pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const HomePage()),
          (r) => false,
        );
      });
    });
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

                    return GestureDetector(
                      onTap: () {
                        for (final popup in List<PopupMessage>.from(popups)) {
                          _popupService.handlePopupClose(message: popup, confirmed: false);
                        }
                      },
                      child: Container(
                        color: Colors.black.withValues(alpha: 0.5),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 1, sigmaY: 1),
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: popups.map((popup) {
                                return GestureDetector(
                                  onTap: () {},
                                  child: WarningConfirmationPopup(
                                    message: popup.message,
                                    hasCloseButton: popup.hasCloseButton,
                                    isConfirmation: popup.isConfirmation,
                                    popupColor: popup.popupColor,
                                    onClosed: (confirmed) {
                                      _popupService.handlePopupClose(message: popup, confirmed: confirmed);
                                    },
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            );

            if (_preferencesService.currentTheme.value != AppTheme.Dark) {
              return content;
            }

            return ColorFiltered(
              colorFilter: POPUP_COLOR_FILTER,
              child: ColorFiltered(
                colorFilter: DARK_DESATURATION_FILTER,
                child: ColorFiltered(
                  colorFilter: DARK_CONTRAST_FILTER,
                  child: ColorFiltered(colorFilter: DARK_BRIGHTNESS_FILTER, child: content),
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
