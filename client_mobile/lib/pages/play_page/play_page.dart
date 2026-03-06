import 'dart:async';
import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/game_data.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/play_service/play_service.dart';
import 'package:client_mobile/widgets/item_drop_popup/item_drop_popup.dart';
import 'package:client_mobile/widgets/timer/timer.dart';
import 'package:flutter/material.dart';

import 'play_page_const.dart';
import 'play_page_widgets.dart';

class PlayPage extends StatefulWidget {
  const PlayPage({super.key});

  @override
  State<PlayPage> createState() => _PlayPageState();
}

class _PlayPageState extends State<PlayPage> {
  late final backgroundThumbnail = backgroundFromThumbnail(MatchService().matchData!.gameData.thumbnail);

  late MatchData _matchData;
  late StreamSubscription<MatchData> _matchDataSubscription;

  MatchData get matchData => _matchData;
  GameData get gameData => _matchData.gameData;
  List<PlayerData> get players => _matchData.players;
  PlayerData get selfPlayer => MatchService().selfPlayer!;

  bool get isSelfTurn => MatchService().isActivePlayer();
  bool get hasAction => PlayService().canAct();
  bool get canEndTurn => PlayService().canEndTurn();
  int get movementLeft => isSelfTurn ? MatchService().matchData!.playData.movementLeft : 0;
  int get activePlayerIndex => MatchService().matchData!.playData.activePlayerIndex;

  @override
  void initState() {
    super.initState();

    _matchData = MatchService().matchData!;

    _matchDataSubscription = MatchService().matchUpdates.listen((updatedMatchData) {
      if (!mounted) return;

      _showItemDropPopup();
      if (matchData.state == MatchState.itemDropSelection) {
        _hideItemDropPopup();
      }

      setState(() => _matchData = updatedMatchData);
    });
  }

  @override
  void dispose() {
    _matchDataSubscription.cancel();
    super.dispose();
  }

  void _showItemDropPopup() {
    if (MatchService().selfPlayer!.items.length >= 3) {
      Navigator.of(context, rootNavigator: true).popUntil((route) => route.isFirst);

      showDialog(
        context: context,
        barrierDismissible: true,
        builder: (context) => DefaultTextStyle(
          style: const TextStyle(decoration: TextDecoration.none),
          child: ItemDropPopup(controller: TextEditingController(), onClose: () => Navigator.of(context).pop()),
        ),
      );
    }
  }

  void _hideItemDropPopup() {
    Navigator.of(context, rootNavigator: true).popUntil((route) => route.isFirst);
  }

  double _computeBaseSize(Size screenSize) {
    final screenWidth = screenSize.width;
    final screenHeight = screenSize.height;

    late final double baseWidth;
    late final double baseHeight;

    if (screenWidth / screenHeight > DESIGN_ASPECT_RATIO) {
      baseHeight = screenHeight;
      baseWidth = baseHeight * DESIGN_ASPECT_RATIO;
    } else {
      baseWidth = screenWidth;
      baseHeight = baseWidth / DESIGN_ASPECT_RATIO;
    }

    return min(baseWidth, baseHeight);
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);

    final outerBorderWidth = baseSize * 0.02;
    final innerBorderWidth = baseSize * 0.02;

    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: OUTER_BORDER_COLOR, width: outerBorderWidth),
              ),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: INNER_BORDER_COLOR, width: innerBorderWidth),
                ),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Container(decoration: BoxDecoration(image: backgroundThumbnail)),
                    ClipRect(
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                        child: Container(color: Colors.black.withValues(alpha: 0.12)),
                      ),
                    ),
                    Column(
                      children: [
                        PlayTimerWidget(height: baseSize * 0.056, fontFamily: PIXEL_FONT, shadowColor: PIXEL_SHADOW_COLOR),
                        Expanded(
                          child: Center(
                            child: AspectRatio(
                              aspectRatio: DESIGN_ASPECT_RATIO,
                              child: Container(
                                color: Colors.white.withValues(alpha: 0),
                                child: LayoutBuilder(
                                  builder: (context, constraints) {
                                    final baseBodySize = min(constraints.maxWidth, constraints.maxHeight);

                                    final panelGapX = baseBodySize * 0.03;
                                    final panelGapY = baseBodySize * 0.02;

                                    return Padding(
                                      padding: EdgeInsets.symmetric(horizontal: panelGapX, vertical: panelGapY),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.stretch,
                                        children: [
                                          Expanded(
                                            child: LeftPanel(baseBodySize: baseBodySize, players: players, activePlayerIndex: activePlayerIndex),
                                          ),
                                          SizedBox(width: panelGapX),
                                          AspectRatio(
                                            aspectRatio: 1,
                                            child: MapPanel(matchData: matchData, baseSize: baseBodySize),
                                          ),
                                          SizedBox(width: panelGapX),
                                          Expanded(
                                            child: RightPanel(
                                              baseBodySize: baseBodySize,
                                              panelGapY: panelGapY,
                                              gameData: gameData,
                                              selfPlayer: selfPlayer,
                                              isSelfTurn: isSelfTurn,
                                              hasAction: hasAction,
                                              canEndTurn: canEndTurn,
                                              onSurrender: () => MatchService().leaveMatch(),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
