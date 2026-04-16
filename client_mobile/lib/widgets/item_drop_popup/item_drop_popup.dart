import 'dart:math';
import 'dart:ui';

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/item_type.dart';
import 'package:client_mobile/pages/play_page/play_page_widgets.dart';
import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:client_mobile/services/play_service/play_service.dart';
import 'package:client_mobile/widgets/poke_button/poke_button.dart';
import 'package:flutter/material.dart';

import 'item_drop_popup_const.dart';

class ItemDropPopup extends StatefulWidget {
  const ItemDropPopup({super.key, required this.controller, required this.onClose, this.initialIsAggressive = true});

  final TextEditingController controller;
  final VoidCallback onClose;
  final bool initialIsAggressive;

  @override
  State<ItemDropPopup> createState() => _ItemDropPopupState();
}

class _ItemDropPopupState extends State<ItemDropPopup> {
  static const _slotCount = 3;

  List<ItemType> get items => MatchService().selfPlayer!.items;
  int selectedIndex = 2;

  final List<OverlayPortalController> _tooltipControllers = List.generate(_slotCount, (_) => OverlayPortalController());
  final List<LayerLink> _tooltipLinks = List.generate(_slotCount, (_) => LayerLink());
  final List<Object> _tooltipGroupIds = List.generate(_slotCount, (_) => Object());

  void _showTooltip(int index) {
    for (var i = 0; i < _tooltipControllers.length; i++) {
      if (i == index) continue;
      if (_tooltipControllers[i].isShowing) _tooltipControllers[i].hide();
    }
    if (!_tooltipControllers[index].isShowing) _tooltipControllers[index].show();
  }

  void _hideTooltip(int index) {
    if (_tooltipControllers[index].isShowing) _tooltipControllers[index].hide();
  }

  TextStyle _pixelTextStyle(double fontSize) => TextStyle(
    fontFamily: FONT_FAMILY,
    color: Colors.white,
    fontSize: fontSize,
    decoration: TextDecoration.none,
    height: 0.9,
    shadows: [Shadow(offset: Offset(fontSize * 0.10, 0), blurRadius: 0, color: SHADOW_COLOR)],
  );

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

  void _select(int index) {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    if (selectedIndex == index) return;
    setState(() => selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final baseSize = _computeBaseSize(MediaQuery.of(context).size);

    final dialogHeight = baseSize * 0.55;
    final dialogWidth = dialogHeight * 172 / 84;
    final contentPadding = baseSize * 0.055;

    final titleStyle = _pixelTextStyle(baseSize * 0.05);

    final i18n = I18nService();

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: BLUR_SIGMA, sigmaY: BLUR_SIGMA),
              child: Container(color: Colors.black.withValues(alpha: OVERLAY_ALPHA)),
            ),
          ),
        ),
        Center(
          child: Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: (_) {},
            child: SizedBox(
              height: dialogHeight,
              width: dialogWidth,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(CONTAINER_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  Padding(
                    padding: EdgeInsets.all(contentPadding),
                    child: Column(
                      children: [
                        Expanded(
                          flex: 2,
                          child: Center(child: Text(i18n.translate(TITLE_KEY), style: titleStyle)),
                        ),
                        Expanded(
                          flex: 4,
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              final double squareSize = constraints.maxHeight * 0.9;
                              return Center(
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: List.generate(3, (index) {
                                    final slot = Container(
                                      width: squareSize,
                                      height: squareSize,
                                      margin: EdgeInsets.symmetric(horizontal: squareSize * 0.3),
                                      child: Stack(
                                        alignment: Alignment.center,
                                        children: [
                                          if (index == selectedIndex)
                                            Image.asset(
                                              SELECTION_ASSET,
                                              width: squareSize,
                                              height: squareSize,
                                              fit: BoxFit.contain,
                                              filterQuality: FilterQuality.none,
                                            ),
                                          Image.asset(
                                            items[index].assetPath,
                                            width: squareSize * 0.8,
                                            height: squareSize * 0.8,
                                            fit: BoxFit.contain,
                                            filterQuality: FilterQuality.none,
                                          ),
                                        ],
                                      ),
                                    );

                                    return OverlayPortal(
                                      controller: _tooltipControllers[index],
                                      overlayChildBuilder: (context) {
                                        return Positioned(
                                          left: 0,
                                          top: 0,
                                          child: CompositedTransformFollower(
                                            link: _tooltipLinks[index],
                                            targetAnchor: Alignment.topCenter,
                                            followerAnchor: Alignment.bottomCenter,
                                            offset: Offset(0, -baseSize * 0.01),
                                            child: TapRegion(
                                              groupId: _tooltipGroupIds[index],
                                              onTapOutside: (_) => _hideTooltip(index),
                                              child: ItemDescriptionTooltip(baseBodySize: baseSize, item: items[index]),
                                            ),
                                          ),
                                        );
                                      },
                                      child: TapRegion(
                                        groupId: _tooltipGroupIds[index],
                                        child: GestureDetector(
                                          behavior: HitTestBehavior.opaque,
                                          onTap: () => _select(index),
                                          onLongPress: () => _showTooltip(index),
                                          child: CompositedTransformTarget(link: _tooltipLinks[index], child: slot),
                                        ),
                                      ),
                                    );
                                  }),
                                ),
                              );
                            },
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Center(
                            child: SizedBox(
                              width: baseSize * 0.4,
                              height: baseSize * 0.20,
                              child: PokeButton(text: i18n.translate(CONFIRM_BUTTON_KEY), onTap: () => PlayService().dropItem(items[selectedIndex])),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
