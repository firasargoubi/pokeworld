import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/services/combat_service/combat_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class _MockSocket extends Mock implements io.Socket {}

void main() {
  late _MockSocket mockSocket;

  setUpAll(() {
    mockSocket = _MockSocket();
    when(() => mockSocket.on(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.emit(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.id).thenReturn(null);
    SocketService().socket = mockSocket;
    CombatService();
  });

  setUp(() => clearInteractions(mockSocket));

  group('attack', () {
    test('should emit Attack event to socket', () {
      CombatService().attack();
      verify(() => mockSocket.emit(CombatEvent.Attack.value, any())).called(1);
    });
  });

  group('escape', () {
    test('should emit Escape event to socket', () {
      CombatService().escape();
      verify(() => mockSocket.emit(CombatEvent.Escape.value, any())).called(1);
    });
  });
}
