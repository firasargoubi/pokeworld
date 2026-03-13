import 'package:flutter/material.dart';

class NavigationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  void navigateAndReplace(WidgetBuilder builder) {
    final nav = NavigationService.navigatorKey.currentState;
    if (nav == null) return;
    final route = MaterialPageRoute(builder: builder);
    nav.pushAndRemoveUntil(route, (r) => false);
  }
}
