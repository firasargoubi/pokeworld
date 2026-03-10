import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'app.dart';
import 'services/chat_service/chat_service.dart';
import 'services/socket_service.dart';

Future<void> main() async {
  try {
    const flavor = String.fromEnvironment('FLAVOR', defaultValue: 'dev');
    await dotenv.load(fileName: flavor == 'prod' ? '.env.prod' : '.env.dev');
  } catch (e) {
    debugPrint('ERROR: Failed to load .env file: $e');
  }
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  SocketService().connect();
  ChatService().initListeners();
  runApp(const PokeWorldApp());
}
