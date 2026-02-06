import 'dart:async';

import 'package:flutter/material.dart';

import '../services/chat_service.dart';
import '../services/user_service.dart';
import '../utils/time_utils.dart';

class ChatBox extends StatefulWidget {
  const ChatBox({super.key});

  @override
  State<ChatBox> createState() => _ChatBoxState();
}

class _ChatBoxState extends State<ChatBox> {
  final TextEditingController _messageController = TextEditingController();

  final _chatService = ChatService();

  StreamSubscription<List<ChatMessage>>? _sub;
  StreamSubscription<int>? _emojiSub;
  late List<ChatMessage> _messages = _chatService.allMessages;
  late int _selectedEmojiIndex = _chatService.selectedEmojiIndex;

  @override
  void initState() {
    super.initState();

    _chatService.startListeningToMotion();

    _sub = _chatService.generalMessagesStream.listen((messages) {
      setState(() {
        _messages = messages;
      });
      // Automatically scroll to the bottom when a new message is received
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
      });
    });

    _emojiSub = _chatService.selectedEmojiStream.listen((index) {
      setState(() {
        _selectedEmojiIndex = index;
      });
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _chatService.sendGeneralMessage(text);
    _messages = _chatService.allMessages;
    setState(() {});
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });

    _messageController.clear();
  }

  @override
  void dispose() {
    _sub?.cancel();
    _emojiSub?.cancel();
    _scrollController.dispose();
    _messageController.dispose();
    _chatService.stopListeningToMotion();
    super.dispose();
  }

  final ScrollController _scrollController = ScrollController();

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = _messages;

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final msg = messages[index];
              final isSelfSent =
                  msg.sender == UserService().currentUser.value?.username;

              return Padding(
                padding: const EdgeInsets.all(8.0),
                child: Align(
                  alignment: isSelfSent
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.all(12.0),
                    decoration: BoxDecoration(
                      color: isSelfSent ? Colors.blue[100] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: Text(
                      '[${formatTime(msg.timestamp.toLocal())}] ${msg.sender}: ${msg.content}',
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_chatService.emojis.length, (index) {
                  final isSelected = _selectedEmojiIndex == index;
                  return GestureDetector(
                    onTap: () {
                      _chatService.selectEmoji(index);
                    },
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 8.0),
                      padding: const EdgeInsets.all(8.0),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: isSelected ? Colors.blue : Colors.transparent,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                      child: Text(
                        _chatService.emojis[index],
                        style: const TextStyle(fontSize: 24),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8.0),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Entrez votre message...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8.0),
                  FloatingActionButton(
                    onPressed: _sendMessage,
                    child: const Icon(Icons.send),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
