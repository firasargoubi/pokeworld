import 'package:flutter/material.dart';

import 'pages/home_page.dart';
import 'services/navigation_service.dart';

class PokeWorldApp extends StatelessWidget {
  const PokeWorldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: NavigationService.navigatorKey,
      debugShowCheckedModeBanner: false,
      title: 'PokeWorld',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}
