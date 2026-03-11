import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  late io.Socket socket;

  void connect() {
    final serverUrl = dotenv.env['SERVER_URL'];

    if (serverUrl == null) {
      return;
    }
    socket = io.io(serverUrl, io.OptionBuilder().setTransports(['websocket']).disableAutoConnect().build());

    socket.connect();
  }

  void disconnect() {
    socket.disconnect();
  }

  void emit(String event, [dynamic data, void Function(dynamic)? ack]) {
    if (ack == null) {
      socket.emit(event, data);
    } else {
      socket.emitWithAck(event, data, ack: (response) => ack(response));
    }
  }
}
