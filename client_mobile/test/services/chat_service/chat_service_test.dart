import 'package:client_mobile/models/socket_event.dart';
import 'package:client_mobile/services/chat_service/chat_service.dart';
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
      final handler = invocation.positionalArguments[1] as dynamic Function(dynamic);
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
    ChatService().setActiveMatchCode(null);
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

  group('channelMessage socket event', () {
    const testChannel = 'match-1234';

    test('should store message in channelMessages', () {
      socketHandlers[ChatEvent.ChannelMessage.value]?.call(buildChannelMessageJson(channelName: testChannel));
      expect(ChatService().channelMessages[testChannel], hasLength(1));
      expect(ChatService().channelMessages[testChannel]!.first.content, equals('Hello'));
    });

    test('should emit on matchMessagesStream when channel matches activeMatchCode', () async {
      ChatService().setActiveMatchCode(testChannel);
      final future = expectLater(ChatService().matchMessagesStream, emits(hasLength(1)));
      socketHandlers[ChatEvent.ChannelMessage.value]?.call(buildChannelMessageJson(channelName: testChannel));
      await future;
    });

    test('should not emit on matchMessagesStream when channel does not match activeMatchCode', () async {
      ChatService().setActiveMatchCode('other-code');
      var emitted = false;
      final sub = ChatService().matchMessagesStream.listen((_) => emitted = true);
      socketHandlers[ChatEvent.ChannelMessage.value]?.call(buildChannelMessageJson(channelName: testChannel));
      await Future(() {});
      expect(emitted, isFalse);
      await sub.cancel();
    });
  });

  group('channelUpdate socket event', () {
    test('should update channels list', () {
      socketHandlers[ChatEvent.ChannelUpdate.value]?.call([buildChannelJson(name: 'general')]);
      expect(ChatService().channels, hasLength(1));
      expect(ChatService().channels.first.name, equals('general'));
    });

    test('should emit updated list on channelsStream', () async {
      final future = expectLater(ChatService().channelsStream, emits(hasLength(1)));
      socketHandlers[ChatEvent.ChannelUpdate.value]?.call([buildChannelJson()]);
      await future;
    });
  });

  group('setActiveMatchCode', () {
    test('should store the match code', () {
      ChatService().setActiveMatchCode('match-abc');
      expect(ChatService().activeMatchCode, equals('match-abc'));
    });

    test('should emit current match messages when code is set', () async {
      const code = 'match-abc';
      socketHandlers[ChatEvent.ChannelMessage.value]?.call(buildChannelMessageJson(channelName: code));
      final future = expectLater(ChatService().matchMessagesStream, emits(hasLength(1)));
      ChatService().setActiveMatchCode(code);
      await future;
    });

    test('should emit empty list when code is cleared', () async {
      ChatService().setActiveMatchCode('match-abc');
      final future = expectLater(ChatService().matchMessagesStream, emits(isEmpty));
      ChatService().setActiveMatchCode(null);
      await future;
    });
  });

  group('isInChannel', () {
    test('should return false when user is not logged in', () {
      socketHandlers[ChatEvent.ChannelUpdate.value]?.call([buildChannelJson(name: 'test', members: ['testuser'])]);
      expect(ChatService().isInChannel('test'), isFalse);
    });

    test('should return true when user is a member', () {
      UserService().currentUser.value = buildUserInfo();
      socketHandlers[ChatEvent.ChannelUpdate.value]?.call([buildChannelJson(name: 'test', members: ['testuser'])]);
      expect(ChatService().isInChannel('test'), isTrue);
    });

    test('should return false when user is not a member', () {
      UserService().currentUser.value = buildUserInfo();
      socketHandlers[ChatEvent.ChannelUpdate.value]?.call([buildChannelJson(name: 'test', members: ['other'])]);
      expect(ChatService().isInChannel('test'), isFalse);
    });
  });

  group('joinChannel', () {
    test('should not emit when user is not logged in', () {
      ChatService().joinChannel('test-channel');
      verifyNever(() => mockSocket.emit(ChatEvent.JoinChannel.value, any()));
    });

    test('should emit JoinChannel event when user is logged in', () {
      UserService().currentUser.value = buildUserInfo();
      ChatService().joinChannel('test-channel');
      verify(() => mockSocket.emit(ChatEvent.JoinChannel.value, any())).called(1);
    });
  });

  group('leaveChannel', () {
    test('should not emit when user is not logged in', () {
      ChatService().leaveChannel('test-channel');
      verifyNever(() => mockSocket.emit(ChatEvent.LeaveChannel.value, any()));
    });

    test('should emit LeaveChannel event when user is logged in', () {
      UserService().currentUser.value = buildUserInfo();
      ChatService().leaveChannel('test-channel');
      verify(() => mockSocket.emit(ChatEvent.LeaveChannel.value, any())).called(1);
    });

    test('should remove cached messages for the channel', () {
      const code = 'test-channel';
      socketHandlers[ChatEvent.ChannelMessage.value]?.call(buildChannelMessageJson(channelName: code));
      expect(ChatService().channelMessages[code], hasLength(1));
      UserService().currentUser.value = buildUserInfo();
      ChatService().leaveChannel(code);
      expect(ChatService().channelMessages[code], isNull);
    });
  });

  group('createChannel', () {
    test('should not emit when user is not logged in', () {
      ChatService().createChannel('my-channel');
      verifyNever(() => mockSocket.emit(ChatEvent.CreateChannel.value, any()));
    });

    test('should emit CreateChannel event when user is logged in', () {
      UserService().currentUser.value = buildUserInfo();
      ChatService().createChannel('my-channel');
      verify(() => mockSocket.emit(ChatEvent.CreateChannel.value, any())).called(1);
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
      verify(() => mockSocket.emit(ChatEvent.GeneralMessage.value, any())).called(1);
    });
  });

  group('sendMatchMessage', () {
    test('should not emit when activeMatchCode is null', () {
      UserService().currentUser.value = buildUserInfo();
      ChatService().sendMatchMessage('test');
      verifyNever(() => mockSocket.emit(ChatEvent.ChannelMessage.value, any()));
    });

    test('should not emit when user is not logged in', () {
      ChatService().setActiveMatchCode('match-1234');
      ChatService().sendMatchMessage('test');
      verifyNever(() => mockSocket.emit(ChatEvent.ChannelMessage.value, any()));
    });

    test('should emit ChannelMessage event with match code when user and code are set', () {
      UserService().currentUser.value = buildUserInfo();
      ChatService().setActiveMatchCode('match-1234');
      ChatService().sendMatchMessage('test');
      verify(() => mockSocket.emit(ChatEvent.ChannelMessage.value, any())).called(1);
    });
  });

  group('clearChatHistory', () {
    test('should empty allMessages', () {
      socketHandlers[ChatEvent.GeneralMessage.value]?.call(buildMessageJson());
      ChatService().clearChatHistory();
      expect(ChatService().allMessages, isEmpty);
    });

    test('should clear channelMessages', () {
      socketHandlers[ChatEvent.ChannelMessage.value]?.call(buildChannelMessageJson());
      ChatService().clearChatHistory();
      expect(ChatService().channelMessages, isEmpty);
    });

    test('should emit empty list on generalMessagesStream', () async {
      final future = expectLater(ChatService().generalMessagesStream, emits(isEmpty));
      ChatService().clearChatHistory();
      await future;
    });

    test('should emit empty list on matchMessagesStream', () async {
      final future = expectLater(ChatService().matchMessagesStream, emits(isEmpty));
      ChatService().clearChatHistory();
      await future;
    });
  });

  group('dispose', () {
    test('should close all stream controllers', () async {
      final generalDone = ChatService().generalMessagesStream.isEmpty;
      final matchDone = ChatService().matchMessagesStream.isEmpty;
      ChatService().dispose();
      await expectLater(generalDone, completion(isTrue));
      await expectLater(matchDone, completion(isTrue));
    });
  });
}
