import 'package:client_mobile/models/map_data.dart';
import 'package:client_mobile/models/player_data.dart';
import 'package:client_mobile/models/stat_data.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/widgets/chat/chat.dart';
import 'package:client_mobile/widgets/stat_container/stat_container.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';

import 'stat_page_const.dart';

TextStyle pixelLineStyle(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT,
  color: Colors.black,
  fontSize: fontSize,
  height: 1.3,
  shadows: [Shadow(offset: Offset(fontSize * 0.05, 0), color: PIXEL_SHADOW_COLOR, blurRadius: 0)],
);

TextStyle titleStyle(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT,
  color: STAT_TITLE_COLOR,
  fontSize: fontSize,
  height: 1.1,
  shadows: [Shadow(offset: Offset(fontSize * 0.05, fontSize * 0.05), color: PIXEL_SHADOW_COLOR, blurRadius: 0)],
);

TextStyle columnTitleStyle(double fontSize) => TextStyle(
  fontFamily: PIXEL_FONT,
  color: STAT_COLUMN_TITLE_COLOR,
  fontSize: fontSize,
  height: 1.1,
  shadows: [Shadow(offset: Offset(fontSize * 0.05, fontSize * 0.05), color: PIXEL_SHADOW_COLOR, blurRadius: 0)],
);

class StatPageFrame extends StatelessWidget {
  const StatPageFrame({
    super.key,
    required this.baseSize,
    required this.outerBorderWidth,
    required this.innerBorderWidth,
    required this.contentWidth,
    required this.contentHeight,
    required this.padding,
    required this.child,
  });

  final double baseSize;
  final double outerBorderWidth;
  final double innerBorderWidth;
  final double contentWidth;
  final double contentHeight;
  final double padding;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: STAT_PAGE_OUTER_BORDER_COLOR, width: outerBorderWidth),
      ),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: STAT_PAGE_INNER_BORDER_COLOR, width: innerBorderWidth),
        ),
        child: CustomPaint(
          painter: StripePainter(
            stripeSize: baseSize * STAT_PAGE_STRIPE_SIZE_FACTOR,
            color1: STAT_PAGE_STRIPE_COLOR_1,
            color2: STAT_PAGE_STRIPE_COLOR_2,
          ),
          child: Center(
            child: SizedBox(
              width: contentWidth,
              height: contentHeight,
              child: Padding(padding: EdgeInsets.all(padding), child: child),
            ),
          ),
        ),
      ),
    );
  }
}

class StatSectionHeader extends StatelessWidget {
  const StatSectionHeader({
    super.key,
    required this.title,
    required this.baseSize,
    this.alignment = Alignment.center,
    this.horizontalPaddingFactor = 0,
  });

  final String title;
  final double baseSize;
  final Alignment alignment;
  final double horizontalPaddingFactor;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: baseSize * STAT_COLUMN_HEADER_HEIGHT_FACTOR,
      child: Container(
        color: STAT_HEADER_BACKGROUND_COLOR,
        alignment: alignment,
        padding: EdgeInsets.symmetric(horizontal: baseSize * horizontalPaddingFactor),
        child: Text(title, style: titleStyle(baseSize * STAT_TITLE_FONT_FACTOR)),
      ),
    );
  }
}

class StatValueCell extends StatelessWidget {
  const StatValueCell({super.key, required this.text, required this.baseSize, this.backgroundColor});

  final String text;
  final double baseSize;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: baseSize * STAT_ITEM_HORIZONTAL_PADDING_FACTOR),
      child: SizedBox(
        height: baseSize * STAT_ITEM_HEIGHT_FACTOR,
        child: Container(
          color: backgroundColor ?? Colors.transparent,
          alignment: Alignment.center,
          child: Text(text, style: pixelLineStyle(baseSize * STAT_LINE_FONT_FACTOR)),
        ),
      ),
    );
  }
}

class StatColumnBody extends StatelessWidget {
  const StatColumnBody({super.key, required this.baseSize, required this.children});

  final double baseSize;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          border: Border(
            right: BorderSide(color: STAT_COLUMN_BORDER_COLOR, width: baseSize * STAT_COLUMN_BORDER_WIDTH_FACTOR),
          ),
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.start, crossAxisAlignment: CrossAxisAlignment.center, children: children),
      ),
    );
  }
}

class StatColumn extends StatelessWidget {
  const StatColumn({
    super.key,
    required this.title,
    required this.values,
    required this.isSelfList,
    required this.baseSize,
    required this.isSorting,
    required this.isAscending,
    this.onTap,
  });

  final String title;
  final List<String> values;
  final List<bool> isSelfList;
  final double baseSize;
  final bool isSorting;
  final bool isAscending;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: baseSize * STAT_COLUMN_WIDTH_FACTOR,
      height: double.infinity,
      child: Column(
        children: [
          GestureDetector(
            onTap: onTap,
            child: SizedBox(
              width: double.infinity,
              height: baseSize * STAT_COLUMN_HEADER_HEIGHT_FACTOR,
              child: Container(
                color: STAT_HEADER_BACKGROUND_COLOR,
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(title, style: columnTitleStyle(baseSize * STAT_TITLE_FONT_FACTOR)),
                    if (onTap != null) ...[
                      SizedBox(width: baseSize * STAT_ITEM_HORIZONTAL_PADDING_FACTOR),
                      Transform.rotate(
                        angle: isSorting && !isAscending ? STAT_PI_ROTATION : 0,
                        child: Image.asset(
                          isSorting ? STAT_ASC_ARROW_ASSET : STAT_DEFAULT_ARROW_ASSET,
                          height: baseSize * STAT_TITLE_FONT_FACTOR,
                          filterQuality: FilterQuality.none,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
          SizedBox(width: double.infinity, height: baseSize * STAT_COLUMN_SPACING_FACTOR),
          StatColumnBody(
            baseSize: baseSize,
            children: List.generate(
              values.length,
              (index) =>
                  StatValueCell(text: values[index], baseSize: baseSize, backgroundColor: isSelfList[index] ? STAT_SELF_HIGHLIGHT_COLOR : null),
            ),
          ),
        ],
      ),
    );
  }
}

class PlayerNamesColumn extends StatelessWidget {
  const PlayerNamesColumn({super.key, required this.players, required this.baseSize});

  final List<StatData> players;
  final double baseSize;

  Color? _backgroundColor(StatData player) {
    if (player.team == Team.Red) {
      return STAT_TEAM_RED_COLOR;
    }
    if (player.team == Team.Blue) {
      return STAT_TEAM_BLUE_COLOR;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: baseSize * STAT_LEFT_COLUMN_WIDTH_FACTOR,
      height: double.infinity,
      child: Column(
        children: [
          StatSectionHeader(title: I18nService().translate(STAT_PLAYERS_TITLE_KEY), baseSize: baseSize),
          SizedBox(width: double.infinity, height: baseSize * STAT_COLUMN_SPACING_FACTOR),
          StatColumnBody(
            baseSize: baseSize,
            children: players
                .map((player) => StatValueCell(text: player.name, baseSize: baseSize, backgroundColor: _backgroundColor(player)))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class StatLine extends StatelessWidget {
  const StatLine({super.key, required this.label, required this.value, required this.baseSize});

  final String label;
  final String value;
  final double baseSize;

  @override
  Widget build(BuildContext context) {
    final style = pixelLineStyle(baseSize * STAT_LINE_FONT_FACTOR);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: style),
        Text(value, style: style),
      ],
    );
  }
}

class GameStatsPanel extends StatelessWidget {
  const GameStatsPanel({
    super.key,
    required this.baseSize,
    required this.stats,
    required this.winner,
    required this.formatDuration,
    required this.formatRatio,
  });

  final double baseSize;
  final dynamic stats;
  final WinnerVisualData? winner;
  final String Function(int ms) formatDuration;
  final String Function(double ratio) formatRatio;

  @override
  Widget build(BuildContext context) {
    final showFlagHolders = MatchService().matchData?.gameData.mapData.gameMode == GameMode.CTF;

    return AspectRatio(
      aspectRatio: STAT_GAME_PANEL_ASPECT_RATIO,
      child: StatContainer(
        baseSize: baseSize * STAT_PAGE_BASE_WIDGET_SIZE_FACTOR,
        child: Row(
          children: [
            Expanded(
              flex: 3,
              child: Column(
                children: [
                  StatSectionHeader(
                    title: I18nService().translate(STAT_GAME_TITLE_KEY),
                    baseSize: baseSize,
                    alignment: Alignment.centerLeft,
                    horizontalPaddingFactor: STAT_GAME_HEADER_HORIZONTAL_PADDING_FACTOR,
                  ),
                  Expanded(
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: baseSize * STAT_GAME_CONTENT_HORIZONTAL_PADDING_FACTOR),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          StatLine(
                            label: I18nService().translate(STAT_DURATION_LABEL_KEY),
                            value: formatDuration(stats.gameDuration),
                            baseSize: baseSize,
                          ),
                          StatLine(label: I18nService().translate(STAT_ROUNDS_LABEL_KEY), value: stats.rounds.toString(), baseSize: baseSize),
                          StatLine(
                            label: I18nService().translate(STAT_VISITED_TILES_LABEL_KEY),
                            value: formatRatio(stats.visitedTilesRatio),
                            baseSize: baseSize,
                          ),
                          StatLine(
                            label: I18nService().translate(STAT_TOGGLED_BRIDGES_LABEL_KEY),
                            value: formatRatio(stats.toggledBridgesRatio),
                            baseSize: baseSize,
                          ),
                          if (showFlagHolders)
                            StatLine(
                              label: I18nService().translate(STAT_FLAG_HOLDERS_LABEL_KEY),
                              value: stats.flagHoldersCount.toString(),
                              baseSize: baseSize,
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Column(
                children: [
                  StatSectionHeader(title: winner?.name.toUpperCase() ?? '', baseSize: baseSize),
                  Expanded(
                    child: Stack(
                      children: [
                        Positioned(
                          bottom: baseSize * STAT_WINNER_TILE_BOTTOM_FACTOR,
                          left: 0,
                          right: 0,
                          child: SizedBox(
                            height: baseSize * STAT_WINNER_TILE_HEIGHT_FACTOR,
                            child: Image.asset(
                              winner?.tileImage ?? STAT_DEFAULT_WINNER_TILE_ASSET,
                              fit: BoxFit.contain,
                              filterQuality: FilterQuality.none,
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: baseSize * STAT_WINNER_AVATAR_BOTTOM_FACTOR,
                          left: 0,
                          right: 0,
                          child: SizedBox(
                            height: baseSize * STAT_WINNER_AVATAR_HEIGHT_FACTOR,
                            child: winner?.avatarImage != null && winner!.avatarImage.isNotEmpty
                                ? Image.asset(winner!.avatarImage, fit: BoxFit.contain, filterQuality: FilterQuality.none)
                                : const SizedBox(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MatchChatOverlay extends StatelessWidget {
  const MatchChatOverlay({
    super.key,
    required this.screenWidth,
    required this.screenHeight,
    required this.baseWidth,
    required this.baseHeight,
    required this.padding,
    required this.contentHeight,
    required this.baseSize,
    required this.keyboardInset,
  });

  final double screenWidth;
  final double screenHeight;
  final double baseWidth;
  final double baseHeight;
  final double padding;
  final double contentHeight;
  final double baseSize;
  final double keyboardInset;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: (screenWidth - baseWidth) / 2 + 3 * padding,
      bottom: screenHeight > 0
          ? keyboardInset > (screenHeight - baseHeight) / 2 + 2 * padding
                ? keyboardInset
                : (screenHeight - baseHeight) / 2 + 2 * padding
          : keyboardInset,
      width: (baseWidth - 7 * padding) / 2,
      height: (contentHeight - 2 * padding) * STAT_CHAT_HEIGHT_RATIO_NUMERATOR / STAT_CHAT_HEIGHT_RATIO_DENOMINATOR,
      child: Chat(baseSize: baseSize * STAT_CHAT_BASE_SIZE_FACTOR, showMatchChannel: true),
    );
  }
}
