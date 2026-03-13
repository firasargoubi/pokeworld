import 'package:flutter/material.dart';

import 'models/popup_message.dart';
import 'models/user_preferences.dart';
import 'pages/home_page/home_page.dart';
import 'services/navigation_service/navigation_service.dart';
import 'services/popup_service/popup_service.dart';
import 'services/preferences_service/preferences_service.dart';
import 'widgets/warning_confirmation_popup/warning_confirmation_popup.dart';

class PokeWorldApp extends StatelessWidget {
  const PokeWorldApp({super.key});

  @override
  Widget build(BuildContext context) {
    final popupService = PopupService();
    final preferencesService = PreferencesService();

    return AnimatedBuilder(
      animation: Listenable.merge([preferencesService.currentLanguage, preferencesService.currentTheme]),
      builder: (_, _) {
        final currentLanguage = preferencesService.currentLanguage.value;
        final currentTheme = preferencesService.currentTheme.value;

        return MaterialApp(
          key: ValueKey<String>('${currentLanguage.code}-${currentTheme.code}'),
          navigatorKey: NavigationService.navigatorKey,
          debugShowCheckedModeBanner: false,
          title: 'PokeWorld',
          locale: preferencesService.currentLocale,
          theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.green), useMaterial3: true),
          builder: (context, child) {
            final content = Stack(
              children: [
                if (child != null) child,
                ValueListenableBuilder<List<PopupMessage>>(
                  valueListenable: popupService.activePopups,
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
                        popupService.handlePopupClose(message: popup, confirmed: confirmed);
                      },
                    );
                  },
                ),
              ],
            );

            if (preferencesService.currentTheme.value != AppTheme.Dark) {
              return content;
            }

            return ColorFiltered(
              colorFilter: const ColorFilter.matrix(<double>[-1, 0, 0, 0, 255, 0, -1, 0, 0, 255, 0, 0, -1, 0, 255, 0, 0, 0, 1, 0]),
              child: content,
            );
          },
          home: HomePage(key: ValueKey<String>('home-${currentLanguage.code}')),
        );
      },
    );
  }
}
