import 'package:flutter/material.dart';

import '../widgets/chat_box.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clavardage')),
      body: const ChatBox(),
    );
  }
}
