import 'dart:math';

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/stat_data.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:client_mobile/services/stat_service/stat_service.dart';
import 'package:client_mobile/services/user_service/user_service.dart';
import 'package:client_mobile/widgets/header/header.dart';
import 'package:client_mobile/widgets/stat_container/stat_container.dart';
import 'package:flutter/material.dart';

import 'stat_page_const.dart';
import 'stat_page_widgets.dart';

class StatPage extends StatefulWidget {
  const StatPage({super.key});

  @override
  State<StatPage> createState() => _StatPageState();
}

class _StatPageState extends State<StatPage> {
  final StatService _statService = StatService();
  final TextEditingController codeController = TextEditingController();

  PlayerStatType _sortingStat = PlayerStatType.combats;
  SortOrder _sortingOrder = SortOrder.ascending;

  final selfId = MatchService().selfId;

  List<bool> get isSelfList => _statService.playerStats.map((player) => player.id == selfId).toList();

  WinnerVisualData? get winner => _statService.winnerData;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (UserService().currentUser.value != null) {
        AudioService().playBackgroundMusic(PreferencesService().getEquippedMenuMusicPath());
      }
    });

    _statService.initializeData();
    _updateSorting(_sortingStat);
  }

  @override
  void dispose() {
    codeController.dispose();
    super.dispose();
  }

  void _updateSorting(PlayerStatType statType) {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    setState(() {
      if (statType == _sortingStat) {
        _sortingOrder = _sortingOrder == SortOrder.ascending ? SortOrder.descending : SortOrder.ascending;
      } else {
        _sortingOrder = SortOrder.ascending;
        _sortingStat = statType;
      }
      _statService.sortPlayerStatsBy(_sortingStat, _sortingOrder);
    });
  }

  String _formatDuration(int ms) {
    final total = ms ~/ 1000;
    final minutes = (total ~/ 60).toString().padLeft(2, '0');
    final seconds = (total % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  String _formatRatio(double ratio) => '${ratio.toStringAsFixed(2)}%';

  String _formatGain(int value) {
    return '${value >= 0 ? '+' : ''}$value \$';
  }

  (double, double) _computeBaseDimensions(double screenWidth, double screenHeight) {
    if (screenWidth / screenHeight > STAT_PAGE_DESIGN_ASPECT_RATIO) {
      final baseHeight = screenHeight;
      final baseWidth = baseHeight * STAT_PAGE_DESIGN_ASPECT_RATIO;
      return (baseWidth, baseHeight);
    }

    final baseWidth = screenWidth;
    final baseHeight = baseWidth / STAT_PAGE_DESIGN_ASPECT_RATIO;
    return (baseWidth, baseHeight);
  }

  Widget _buildStatColumn(String title, List<String> values, List<bool> selfValues, double baseSize, {PlayerStatType? statType}) {
    final isSorting = statType != null && statType == _sortingStat;
    final isAscending = _sortingOrder == SortOrder.ascending;
    final valueTextColor = statType == PlayerStatType.balanceGain ? STAT_BALANCE_GAIN_COLOR : null;

    return StatColumn(
      title: title,
      values: values,
      isSelfList: selfValues,
      baseSize: baseSize,
      isSorting: isSorting,
      isAscending: isAscending,
      valueTextColor: valueTextColor,
      onTap: statType != null ? () => _updateSorting(statType) : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final mediaSize = MediaQuery.of(context).size;
    final screenWidth = mediaSize.width;
    final screenHeight = mediaSize.height;
    final keyboardInset = MediaQuery.of(context).viewInsets.bottom;

    final (baseWidth, baseHeight) = _computeBaseDimensions(screenWidth, screenHeight);
    final baseSize = min(baseWidth, baseHeight);

    final stats = _statService.globalStats;
    final outerBorderWidth = baseSize * STAT_PAGE_BORDER_WIDTH_FACTOR;
    final innerBorderWidth = baseSize * STAT_PAGE_BORDER_WIDTH_FACTOR;
    final padding = baseSize * STAT_PAGE_PADDING_FACTOR;
    final contentHeight = baseHeight - (baseSize * STAT_PAGE_HEADER_HEIGHT_FACTOR) - (padding * 2);
    final contentWidth = baseWidth - (padding * 2);

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Column(
            children: [
              SizedBox(
                height: baseSize * STAT_PAGE_HEADER_HEIGHT_FACTOR,
                width: double.infinity,
                child: AppHeader(index: 1, text: I18nService().translate(STAT_PAGE_HEADER_KEY), onTap: () => MatchService().leaveMatch()),
              ),
              Expanded(
                child: StatPageFrame(
                  baseSize: baseSize,
                  outerBorderWidth: outerBorderWidth,
                  innerBorderWidth: innerBorderWidth,
                  contentWidth: contentWidth,
                  contentHeight: contentHeight,
                  padding: padding,
                  child: Column(
                    children: [
                      Expanded(
                        flex: STAT_MAIN_SECTION_FLEX.toInt(),
                        child: FramedContainer(
                          baseSize: baseSize * STAT_PAGE_BASE_WIDGET_SIZE_FACTOR,
                          child: Row(
                            children: [
                              PlayerNamesColumn(players: _statService.playerStats, baseSize: baseSize),
                              Expanded(
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: Row(
                                    children: [
                                      _buildStatColumn(
                                        I18nService().translate(STAT_GAIN_COLUMN_LABEL_KEY),
                                        _statService.playerStats.map((player) => _formatGain(player.balanceGain)).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.balanceGain,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_ITEMS_LABEL_KEY),
                                        _statService.playerStats.map((player) => player.discoveredItemsCount.toString()).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.discoveredItemsCount,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_TILES_LABEL_KEY),
                                        _statService.playerStats.map((player) => '${player.visitedTilesRatio}').toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.visitedTilesRatio,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_COMBATS_LABEL_KEY),
                                        _statService.playerStats.map((player) => player.combats.toString()).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.combats,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_VICTORIES_LABEL_KEY),
                                        _statService.playerStats.map((player) => player.victories.toString()).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.victories,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_DEFEATS_LABEL_KEY),
                                        _statService.playerStats.map((player) => player.defeats.toString()).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.defeats,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_ESCAPES_LABEL_KEY),
                                        _statService.playerStats.map((player) => player.escapes.toString()).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.escapes,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_HP_INFLICTED_LABEL_KEY),
                                        _statService.playerStats.map((player) => player.hpInflicted.toString()).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.hpInflicted,
                                      ),
                                      _buildStatColumn(
                                        I18nService().translate(STAT_HP_LOST_LABEL_KEY),
                                        _statService.playerStats.map((player) => player.hpLost.toString()).toList(),
                                        isSelfList,
                                        baseSize,
                                        statType: PlayerStatType.hpLost,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(flex: STAT_SPACER_SECTION_FLEX.toInt(), child: Container()),
                      Expanded(
                        flex: STAT_BOTTOM_SECTION_FLEX.toInt(),
                        child: Align(
                          alignment: Alignment.bottomRight,
                          child: Row(
                            children: [
                              Expanded(
                                child: Padding(
                                  padding: EdgeInsets.only(bottom: keyboardInset),
                                  child: const Align(alignment: Alignment.bottomLeft),
                                ),
                              ),
                              SizedBox(width: baseSize * STAT_PAGE_PADDING_FACTOR),
                              Expanded(
                                child: GameStatsPanel(
                                  baseSize: baseSize,
                                  stats: stats,
                                  winner: winner,
                                  formatDuration: _formatDuration,
                                  formatRatio: _formatRatio,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          MatchChatOverlay(
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            baseWidth: baseWidth,
            baseHeight: baseHeight,
            padding: padding,
            contentHeight: contentHeight,
            baseSize: baseSize,
            keyboardInset: max(keyboardInset, (screenHeight - baseHeight) / 2 + 2 * padding),
          ),
        ],
      ),
    );
  }
}
