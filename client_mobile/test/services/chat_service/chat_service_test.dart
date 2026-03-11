import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/services/chat_service/chat_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/socket_service/socket_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'chat_service_test_const.dart';

class _MockSocket extends Mock implements io.Socket {}

void main() {
  late _MockSocket mockSocket;
  final Map<String, dynamic Function(dynamic)> socketHandlers = {};

  setUpAll(() {
    registerFallbackValue((dynamic _) {});

    mockSocket = _MockSocket();

    when(() => mockSocket.on(any(), any())).thenAnswer((invocation) {
      final event = invocation.positionalArguments[0] as String;
      final handler =
          invocation.positionalArguments[1] as dynamic Function(dynamic);
      socketHandlers[event] = handler;
    });
    when(() => mockSocket.emit(any(), any())).thenAnswer((_) {});
    when(() => mockSocket.id).thenReturn(null);

    SocketService().socket = mockSocket;
    ChatService().initListeners();
  });

  setUp(() {
    clearInteractions(mockSocket);
    ChatService().clearChatHistory();
    UserService().currentUser.value = null;
  });

  group('initListeners', () {
    test('should not register socket listeners on second call', () {
      ChatService().initListeners();
      verifyNever(() => mockSocket.on(ChatEvent.GeneralMessage.value, any()));
    });
  });

  group('generalMessage socket event', () {
    test('should add message to allMessages', () {
      socketHandlers[ChatEvent.GeneralMessage.value]?.call(buildMessageJson());
      expect(ChatService().allMessages.length, equals(1));
      expect(ChatService().allMessages.first.content, equals('Hello'));
    });

    test('should emit updated list on generalMessagesStream', () async {
      final future = expectLater(
        ChatService().generalMessagesStream,
        emits(hasLength(1)),
      );
      socketHandlers[ChatEvent.GeneralMessage.value]?.call(buildMessageJson());
      await future;
    });
  });

  group('matchUpdates subscription', () {
    test('should update matchMessages when match updates', () async {
      MatchService().onUpdate(buildMatchData(messages: [buildChatMessage()]));
      await Future(() {});
      expect(ChatService().matchMessages.length, equals(1));
    });

    test('should update matchLogs when match updates', () async {
      MatchService().onUpdate(buildMatchData(logs: [buildChatLog()]));
      await Future(() {});
      expect(ChatService().matchLogs.length, equals(1));
    });

    test('should clear matchMessages when new match data has none', () async {
      MatchService().onUpdate(buildMatchData(messages: [buildChatMessage()]));
      await Future(() {});
      MatchService().onUpdate(buildMatchData());
      await Future(() {});
      expect(ChatService().matchMessages, isEmpty);
    });
  });

  group('sendGeneralMessage', () {
    test('should not emit to socket when user is not logged in', () {
      ChatService().sendGeneralMessage('hello');
      verifyNever(() => mockSocket.emit(ChatEvent.GeneralMessage.value, any()));
    });

    test('should emit to socket when user is logged in', () {
      UserService().currentUser.value = buildUserInfo();
      ChatService().sendGeneralMessage('hello');
      verify(
        () => mockSocket.emit(ChatEvent.GeneralMessage.value, any()),
      ).called(1);
    });
  });

  group('sendMatchMessage', () {
    test('should emit Message event to socket', () {
      ChatService().sendMatchMessage('test');
      verify(() => mockSocket.emit(ChatEvent.Message.value, any())).called(1);
    });
  });

  group('clearChatHistory', () {
    test('should empty allMessages', () {
      socketHandlers[ChatEvent.GeneralMessage.value]?.call(buildMessageJson());
      ChatService().clearChatHistory();
      expect(ChatService().allMessages, isEmpty);
    });

    test('should emit empty list on generalMessagesStream', () async {
      final future = expectLater(
        ChatService().generalMessagesStream,
        emits(isEmpty),
      );
      ChatService().clearChatHistory();
      await future;
    });

    test('should emit empty list on matchMessagesStream', () async {
      final future = expectLater(
        ChatService().matchMessagesStream,
        emits(isEmpty),
      );
      ChatService().clearChatHistory();
      await future;
    });

    test('should emit empty list on matchLogsStream', () async {
      final future = expectLater(ChatService().matchLogsStream, emits(isEmpty));
      ChatService().clearChatHistory();
      await future;
    });
  });

  group('dispose', () {
    test('should close all stream controllers', () async {
      final generalDone = ChatService().generalMessagesStream.isEmpty;
      final matchDone = ChatService().matchMessagesStream.isEmpty;
      final logsDone = ChatService().matchLogsStream.isEmpty;
      ChatService().dispose();
      await expectLater(generalDone, completion(isTrue));
      await expectLater(matchDone, completion(isTrue));
      await expectLater(logsDone, completion(isTrue));
    });
  });
}
