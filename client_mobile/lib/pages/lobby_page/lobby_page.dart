import 'dart:async';
import 'dart:math';

import 'package:client_mobile/consts/match_data_const.dart';
import 'package:client_mobile/consts/player_data_const.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/popup_message.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/lobby_service/lobby_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/popup_service/popup_service.dart';
import 'package:client_mobile/widgets/add_bot_popup/add_bot_popup.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/header/header.dart';
import 'package:client_mobile/widgets/player_card/player_card.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'lobby_page_const.dart';
import 'lobby_page_widgets.dart';

class LobbyPage extends StatefulWidget {
  const LobbyPage({super.key});

  @override
  State<LobbyPage> createState() => _LobbyPageState();
}

class _LobbyPageState extends State<LobbyPage> {
  final PopupService _popupService = PopupService();
  String code = MatchService().matchData?.code ?? 'ABCD1234';
  bool isAdmin = MatchService().isPlayerHost(MatchService().selfId);
  bool isLocked = MatchService().matchData?.lobbyData.isLocked ?? false;

  final mapSize = MatchService().matchData?.gameData.mapData.size;
  late final maxPlayers = MAP_SIZE_PLAYER_COUNT[mapSize] ?? MAP_SIZE_PLAYER_COUNT[MapSize.Small]!;
  late List<PlayerData> players;

  StreamSubscription<MatchData>? _sub;

  List<PlayerData> _list(MatchData? md) {
    final next = (md?.players ?? const <PlayerData>[]).where((p) => p.isConnected).toList(growable: true);
    while (next.length < maxPlayers) {
      next.add(DEFAULT_PLAYER_DATA);
    }
    if (next.length > maxPlayers) next.removeRange(maxPlayers, next.length);
    return next;
  }

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      AudioService().playBackgroundMusic(BackgroundMusic.Menu.path);
    });

    final md = MatchService().matchData;
    code = md?.code ?? 'ABCD1234';
    isAdmin = MatchService().isPlayerHost(MatchService().selfId);
    isLocked = md?.lobbyData.isLocked ?? false;
    players = List<PlayerData>.from(_list(md));

    _sub = MatchService().matchUpdates.listen((md) {
      if (!mounted) return;
      setState(() {
        code = md.code;
        isAdmin = MatchService().isPlayerHost(MatchService().selfId);
        isLocked = md.lobbyData.isLocked;
        players = List<PlayerData>.from(_list(md));
      });
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    _sub = null;
    super.dispose();
  }

  Future<void> _copyCodeToClipboard() => Clipboard.setData(ClipboardData(text: code));

  void _toggleLock() => LobbyService().changeLockStatus(!isLocked);

  void _showAddBotPopup() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => DefaultTextStyle(
        style: const TextStyle(decoration: TextDecoration.none),
        child: AddBotPopup(controller: TextEditingController(), onClose: () => Navigator.of(context).pop()),
      ),
    );
  }

  void _leaveLobby() {
    _sub?.cancel();
    _sub = null;
    MatchService().leaveMatch();
  }

  ({double baseWidth, double baseHeight, double baseSize}) _base(Size s) {
    final w = s.width, h = s.height;
    late final double bw, bh;
    if (w / h > DESIGN_ASPECT_RATIO) {
      bh = h;
      bw = bh * DESIGN_ASPECT_RATIO;
    } else {
      bw = w;
      bh = bw / DESIGN_ASPECT_RATIO;
    }
    return (baseWidth: bw, baseHeight: bh, baseSize: min(bw, bh));
  }

  TextStyle _label(double b) => TextStyle(
    fontFamily: PIXEL_FONT,
    color: Colors.white,
    fontSize: b * 0.035,
    height: 0.9,
    shadows: [Shadow(offset: Offset(b * 0.004, 0), color: SHADOW_COLOR, blurRadius: 0)],
  );

  TextStyle _code(double b) => TextStyle(fontFamily: PIXEL_FONT, color: const Color(0xFFaae7f7), fontSize: b * 0.09, height: 0.9);

  @override
  Widget build(BuildContext context) {
    final b = _base(MediaQuery.of(context).size).baseSize;

    final outerBorderWidth = b * 0.02;
    final innerBorderWidth = b * 0.02;

    final leftPanelWidth = b * 0.55;
    final rightPanelWidth = b * 0.8;
    final totalPanelsWidth = leftPanelWidth + rightPanelWidth;

    final leftPanelPadding = b * 0.03;

    final labelStyle = _label(b);
    final codeStyle = _code(b);

    return Scaffold(
      body: Column(
        children: [
          SizedBox(
            height: b * 0.1,
            width: double.infinity,
            child: AppHeader(
              index: 1,
              text: HEADER_TEXT,
              onTap: () {
                _popupService.showPopup(PopupMessage(message: PopupMessages.Quit.message, isConfirmation: true, action: _leaveLobby));
              },
            ),
          ),
          Expanded(
            child: RepaintBoundary(
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: OUTER_BORDER_COLOR, width: outerBorderWidth),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: INNER_BORDER_COLOR, width: innerBorderWidth),
                  ),
                  child: CustomPaint(
                    painter: StripePainter(stripeSize: b * 0.02, color1: STRIPE_COLOR_1, color2: STRIPE_COLOR_2),
                    child: SizedBox.expand(
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          LayoutBuilder(
                            builder: (context, constraints) {
                              final availableWidth = constraints.maxWidth;
                              final needsScroll = totalPanelsWidth > availableWidth;
                              final rowWidth = max(availableWidth, totalPanelsWidth);

                              return SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                physics: needsScroll ? const BouncingScrollPhysics() : const NeverScrollableScrollPhysics(),
                                child: SizedBox(
                                  width: rowWidth,
                                  height: double.infinity,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      SizedBox(
                                        width: leftPanelWidth,
                                        height: double.infinity,
                                        child: Padding(
                                          padding: EdgeInsets.all(leftPanelPadding),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.stretch,
                                            children: [
                                              LobbyCodePanel(
                                                code: code,
                                                isAdmin: isAdmin,
                                                isLocked: isLocked,
                                                labelStyle: labelStyle,
                                                codeStyle: codeStyle,
                                                onToggleLock: _toggleLock,
                                                onCopy: _copyCodeToClipboard,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        width: rightPanelWidth,
                                        height: double.infinity,
                                        child: ClipRect(
                                          child: OverflowBox(
                                            alignment: Alignment.topCenter,
                                            minHeight: 0,
                                            maxHeight: double.infinity,
                                            child: Column(
                                              children: List.generate(
                                                players.length,
                                                (index) => Container(
                                                  width: double.infinity,
                                                  height: b * 0.10,
                                                  margin: EdgeInsets.only(top: b * 0.01),
                                                  child: PlayerCard(
                                                    key: ValueKey('player_slot_$index'),
                                                    playerData: players[index],
                                                    onActionTap: _showAddBotPopup,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          Positioned(
                            left: b * 0.03,
                            bottom: b * 0.03,
                            width: b * 0.8,
                            height: b * 0.45,
                            child: Align(
                              alignment: Alignment.bottomLeft,
                              child: Chat(baseSize: b * 0.1, showMatchChannel: true),
                            ),
                          ),
                          if (isAdmin)
                            Positioned(
                              right: b * 0.03,
                              bottom: b * 0.015,
                              width: b * 0.32,
                              height: b * 0.13,
                              child: PokeButton(
                                text: LAUNCH_TEXT,
                                onTap: () {
                                  LobbyService().startMatch();
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
