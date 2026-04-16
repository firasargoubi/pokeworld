import 'dart:math';

import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:flutter/material.dart';

import 'poke_button_const.dart';

class PokeButton extends StatefulWidget {
  const PokeButton({super.key, this.onTap, required this.text, this.textLeftGapFactor = 0.20, this.bodyLeftPaddingFactor = 0.1});

  final VoidCallback? onTap;
  final String text;
  final double textLeftGapFactor;
  final double bodyLeftPaddingFactor;

  @override
  State<PokeButton> createState() => _PokeButtonState();
}

class _PokeButtonState extends State<PokeButton> {
  bool _isPressed = false;
  late final PreferencesService _preferencesService;

  @override
  void initState() {
    super.initState();
    _preferencesService = PreferencesService();
    _preferencesService.equippedButtonNotifier.addListener(_handleEquippedButtonChange);
  }

  @override
  void dispose() {
    _preferencesService.equippedButtonNotifier.removeListener(_handleEquippedButtonChange);
    super.dispose();
  }

  void _handleEquippedButtonChange() {
    if (!mounted) return;
    setState(() {});
  }

  void _setPressed(bool value) {
    if (_isPressed == value) return;
    setState(() => _isPressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final borderAsset = _isPressed ? POKE_BUTTON_BORDER_ACTIVE_ASSET : POKE_BUTTON_BORDER_ASSET;
    final containerAsset = _isPressed ? POKE_BUTTON_CONTAINER_ACTIVE_ASSET : POKE_BUTTON_CONTAINER_ASSET;
    final ballAsset = _preferencesService.getEquippedBallAsset(active: _isPressed);

    Widget content = LayoutBuilder(
      builder: (context, constraints) {
        final double buttonHeight = constraints.maxHeight.isFinite ? constraints.maxHeight : POKE_BUTTON_FALLBACK_HEIGHT;

        final double middleSectionHeight = buttonHeight * 0.55;

        final double bodyLeftPad = max(0.0, constraints.maxWidth * widget.bodyLeftPaddingFactor);

        final double textLeftGap = max(0.0, constraints.maxWidth * widget.textLeftGapFactor);

        final textStyle = TextStyle(
          fontFamily: POKE_BUTTON_FONT_FAMILY,
          color: Colors.white,
          fontSize: middleSectionHeight * 0.55,
          height: 1.0,
          shadows: [Shadow(offset: Offset(middleSectionHeight * 0.06, 0), color: POKE_BUTTON_SHADOW_COLOR, blurRadius: 0)],
        );

        return SizedBox.expand(
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Padding(
                padding: EdgeInsets.only(left: bodyLeftPad),
                child: Center(
                  child: SizedBox(
                    height: middleSectionHeight,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        AspectRatio(
                          aspectRatio: POKE_BUTTON_EDGE_ASPECT_RATIO,
                          child: Transform(
                            alignment: Alignment.center,
                            transform: Matrix4.rotationY(pi),
                            child: Image.asset(borderAsset, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              image: DecorationImage(image: AssetImage(containerAsset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                            ),
                            child: Center(
                              child: Padding(
                                padding: EdgeInsets.only(left: textLeftGap, right: middleSectionHeight * 0.25),
                                child: Text(widget.text, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: textStyle),
                              ),
                            ),
                          ),
                        ),
                        AspectRatio(
                          aspectRatio: POKE_BUTTON_EDGE_ASPECT_RATIO,
                          child: Image.asset(borderAsset, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 0,
                left: 0,
                width: buttonHeight,
                height: buttonHeight,
                child: Image.asset(ballAsset, fit: BoxFit.fitHeight, filterQuality: FilterQuality.none),
              ),
            ],
          ),
        );
      },
    );

    if (widget.onTap != null) {
      content = GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => {_setPressed(true), AudioService().playSoundEffect(SoundEffect.Select.path)},
        onTapUp: (_) => _setPressed(false),
        onTapCancel: () => _setPressed(false),
        onTap: widget.onTap,
        child: content,
      );
    }

    return content;
  }
}
