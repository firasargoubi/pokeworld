import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'app.dart';
import 'services/chat_service.dart';
import 'services/socket_service.dart';

Future<void> main() async {
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint('ERROR: Failed to load .env file: $e');
  }
  WidgetsFlutterBinding.ensureInitialized();
  SocketService().connect();
  ChatService().initListeners();
  runApp(const PokeWorldApp());
}
