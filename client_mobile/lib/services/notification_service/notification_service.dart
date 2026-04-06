import 'package:client_mobile/models/chat_message.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'notification_service_const.dart';

const bool _isFlutterTestEnvironment = bool.fromEnvironment('FLUTTER_TEST');

class NotificationService extends ChangeNotifier {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final Map<ChatChannel, int> _receivedCountByChannel = {ChatChannel.General: 0, ChatChannel.Match: 0};
  final Map<ChatChannel, int> _unreadCountByChannel = {ChatChannel.General: 0, ChatChannel.Match: 0};
  final Map<ChatChannel, bool> _isChannelRead = {ChatChannel.General: true, ChatChannel.Match: true};
  final FlutterLocalNotificationsPlugin? _localNotificationsPlugin =
      (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) ? FlutterLocalNotificationsPlugin() : null;

  bool _isChatOpen = false;
  bool _isAppInBackground = false;
  ChatChannel _selectedChannel = ChatChannel.General;
  bool _isInitialized = false;
  int _notificationIdCounter = 0;

  Future<void> init() async {
    if (_isInitialized || _localNotificationsPlugin == null) {
      return;
    }

    _isInitialized = true;

    const initializationSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    );

    await _localNotificationsPlugin.initialize(initializationSettings);

    final androidPlugin = _localNotificationsPlugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    if (androidPlugin != null) {
      await androidPlugin.requestNotificationsPermission();
      await androidPlugin.createNotificationChannel(
        AndroidNotificationChannel(
          NOTIFICATION_CHANNEL_ID,
          NOTIFICATION_CHANNEL_NAME,
          description: NOTIFICATION_CHANNEL_DESCRIPTION,
          importance: Importance.high,
          playSound: true,
          sound: RawResourceAndroidNotificationSound(NOTIFICATION_SOUND_RESOURCE_NAME),
        ),
      );
    }
  }

  void updateChatVisibility({required bool isChatOpen, required ChatChannel selectedChannel}) {
    _isChatOpen = isChatOpen;
    _selectedChannel = selectedChannel;
  }

  void setAppInBackground(bool isInBackground) {
    _isAppInBackground = isInBackground;
  }

  Future<void> clearSystemNotifications() async {
    await init();
    await _localNotificationsPlugin?.cancelAll();
  }

  void onChannelMessagesUpdated(ChatChannel channel, List<ChatMessage> messages) {
    final previousReceivedCount = _receivedCountByChannel[channel] ?? 0;
    final currentLength = messages.length;
    var stateChanged = false;

    if (currentLength > previousReceivedCount) {
      final newMessagesCount = currentLength - previousReceivedCount;
      if (_isChannelOpen(channel)) {
        _unreadCountByChannel[channel] = 0;
        _isChannelRead[channel] = true;
      } else {
        _unreadCountByChannel[channel] = (_unreadCountByChannel[channel] ?? 0) + newMessagesCount;
        _isChannelRead[channel] = false;
        final newMessages = messages.sublist(previousReceivedCount, currentLength);
        _notifyIncomingMessages(channel, newMessages);
        stateChanged = true;
      }
    }

    if (currentLength < previousReceivedCount) {
      _unreadCountByChannel[channel] = 0;
      _isChannelRead[channel] = true;
      stateChanged = true;
    }

    _receivedCountByChannel[channel] = currentLength;

    if (stateChanged) {
      notifyListeners();
    }
  }

  void onChannelRead(ChatChannel channel) {
    final wasRead = _isChannelRead[channel] ?? true;
    final unreadBefore = _unreadCountByChannel[channel] ?? 0;

    if (wasRead && unreadBefore == 0) {
      return;
    }

    _unreadCountByChannel[channel] = 0;
    _isChannelRead[channel] = true;
    notifyListeners();
  }

  void clear() {
    _receivedCountByChannel[ChatChannel.General] = 0;
    _receivedCountByChannel[ChatChannel.Match] = 0;
    _unreadCountByChannel[ChatChannel.General] = 0;
    _unreadCountByChannel[ChatChannel.Match] = 0;
    _isChannelRead[ChatChannel.General] = true;
    _isChannelRead[ChatChannel.Match] = true;
    notifyListeners();
  }

  int unreadCount(ChatChannel channel) => _unreadCountByChannel[channel] ?? 0;

  int totalUnreadCount() {
    return unreadCount(ChatChannel.General) + unreadCount(ChatChannel.Match);
  }

  bool hasUnread(ChatChannel channel) => unreadCount(channel) > 0;

  bool isChannelRead(ChatChannel channel) => _isChannelRead[channel] ?? true;

  bool _isChannelOpen(ChatChannel channel) {
    return _isChatOpen && _selectedChannel == channel;
  }

  Future<void> _notifyIncomingMessages(ChatChannel channel, List<ChatMessage> messages) async {
    if (_isFlutterTestEnvironment) {
      return;
    }

    if (_isAppInBackground) {
      for (final message in messages) {
        await _showSystemNotification(channel: channel, message: message);
      }
      return;
    }

    try {
      await AudioService().playNotificationSoundEffect();
    } catch (_) { }
  }

  Future<void> _showSystemNotification({required ChatChannel channel, required ChatMessage message}) async {
    if (_isFlutterTestEnvironment) {
      return;
    }

    try {
      await init();

      final senderName = message.sender?.trim() ?? '';
      final notificationTitle = senderName.isEmpty
          ? I18nService().translate('components.notifications.newMessage')
          : I18nService().translate('components.notifications.newMessageFrom', params: {'senderName': senderName});
      final messageContent = message.content.trim();
      final notificationBody = messageContent.isEmpty ? I18nService().translate('components.notifications.newMessage') : messageContent;

      if (_localNotificationsPlugin == null) return;
      await _localNotificationsPlugin.show(
        _notificationIdCounter++,
        notificationTitle,
        notificationBody,
        NotificationDetails(
          android: AndroidNotificationDetails(
            NOTIFICATION_CHANNEL_ID,
            NOTIFICATION_CHANNEL_NAME,
            channelDescription: NOTIFICATION_CHANNEL_DESCRIPTION,
            importance: Importance.high,
            priority: Priority.high,
            playSound: true,
            sound: RawResourceAndroidNotificationSound(NOTIFICATION_SOUND_RESOURCE_NAME),
            icon: '@mipmap/ic_launcher',
          ),
        ),
      );
    } catch (_) { }
  }
}
