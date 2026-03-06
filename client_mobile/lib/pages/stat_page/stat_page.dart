import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:flutter/material.dart';

class StatPage extends StatelessWidget {
  const StatPage({super.key});

  Future<void> _onBack(BuildContext context) async {
    MatchService().leaveMatch();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('StatPage'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => _onBack(context)),
      ),
      body: const Center(child: Text('StatPage vide')),
    );
  }
}
