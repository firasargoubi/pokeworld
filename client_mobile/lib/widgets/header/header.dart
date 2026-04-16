import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:flutter/material.dart';

import 'header_const.dart';

class AppHeader extends StatefulWidget {
  final int index;
  final String text;
  final VoidCallback onTap;
  final double textSizeFactor;

  const AppHeader({super.key, required this.index, required this.text, required this.onTap, this.textSizeFactor = 0.55});

  @override
  State<AppHeader> createState() => _AppHeaderState();
}

class _AppHeaderState extends State<AppHeader> {
  bool _isPressed = false;

  static int _normalizeIndex(int i) {
    if (i >= 1 && i <= 3) return i;
    if (i >= 0 && i <= 2) return i + 1;
    return 1;
  }

  void _setPressed(bool value) => setState(() => _isPressed = value);

  void _handleTapUp(_) {
    AudioService().playSoundEffect(SoundEffect.Select.path);
    _setPressed(false);
    widget.onTap();
  }

  List<Shadow> _pixelShadow(double textSize) => [Shadow(offset: Offset(textSize * 0.08, 0), color: APP_HEADER_SHADOW_COLOR, blurRadius: 0)];

  TextStyle _titleStyle(double textSize) =>
      TextStyle(fontFamily: APP_HEADER_FONT_FAMILY, color: Colors.white, fontSize: textSize, height: 1.0, shadows: _pixelShadow(textSize));

  @override
  Widget build(BuildContext context) {
    final idx = _normalizeIndex(widget.index);
    final centerAsset = '$APP_HEADER_CENTER_ASSET_PREFIX$idx.png';

    return LayoutBuilder(
      builder: (context, constraints) {
        final headerHeight = constraints.hasBoundedHeight ? constraints.maxHeight : APP_HEADER_FALLBACK_HEIGHT;

        final buttonSize = headerHeight * 0.60;
        final textSize = headerHeight * widget.textSizeFactor;
        final sidePadding = headerHeight * 0.22;

        return SizedBox(
          width: double.infinity,
          height: headerHeight,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(image: AssetImage(APP_HEADER_LEFT_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  ),
                  child: Padding(
                    padding: EdgeInsets.only(left: sidePadding, top: headerHeight * 0.2),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTapDown: (_) => _setPressed(true),
                          onTapCancel: () => _setPressed(false),
                          onTapUp: _handleTapUp,
                          child: SizedBox(
                            width: buttonSize,
                            height: buttonSize,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                if (_isPressed)
                                  Image.asset(
                                    APP_HEADER_PRESSED_BUTTON_ASSET,
                                    width: buttonSize,
                                    height: buttonSize,
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.none,
                                    color: Colors.white,
                                    colorBlendMode: BlendMode.srcIn,
                                  ),
                                Text('<', style: _titleStyle(buttonSize * 0.75)),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(width: sidePadding),
                        Expanded(
                          child: Text(widget.text, maxLines: 1, overflow: TextOverflow.ellipsis, style: _titleStyle(textSize)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              IntrinsicWidth(
                child: Center(
                  child: Image.asset(centerAsset, height: headerHeight, fit: BoxFit.contain, filterQuality: FilterQuality.none),
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    image: DecorationImage(image: AssetImage(APP_HEADER_RIGHT_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
