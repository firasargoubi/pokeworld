import 'package:flutter/material.dart';

import 'models/popup_message.dart';
import 'pages/home_page/home_page.dart';
import 'services/navigation_service/navigation_service.dart';
import 'services/popup_service/popup_service.dart';
import 'widgets/warning_confirmation_popup/warning_confirmation_popup.dart';

class PokeWorldApp extends StatelessWidget {
  const PokeWorldApp({super.key});

  @override
  Widget build(BuildContext context) {
    final popupService = PopupService();

    return MaterialApp(
      navigatorKey: NavigationService.navigatorKey,
      debugShowCheckedModeBanner: false,
      title: 'PokeWorld',
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.green), useMaterial3: true),
      builder: (context, child) {
        return Stack(
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
      },
      home: const HomePage(),
    );
  }
}
