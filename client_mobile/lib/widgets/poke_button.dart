import 'dart:math';

import 'package:flutter/material.dart';

class PokeButton extends StatefulWidget {
  const PokeButton({
    super.key,
    this.onTap,
    required this.text,
    this.textLeftGapFactor = 0.20,
    this.bodyLeftPaddingFactor = 0.1,
  });

  final VoidCallback? onTap;
  final String text;

  final double textLeftGapFactor;
  final double bodyLeftPaddingFactor;

  @override
  State<PokeButton> createState() => _PokeButtonState();
}

class _PokeButtonState extends State<PokeButton> {
  bool _isPressed = false;

  static const double _FallbackHeight = 48.0;
  static const double _EdgeAspectRatio = 10 / 32;

  static const String _BorderAsset =
      'assets/images/menu/buttons/poke-button/button-border.png';
  static const String _BorderActiveAsset =
      'assets/images/menu/buttons/poke-button/button-border-active.png';

  static const String _ContainerAsset =
      'assets/images/menu/buttons/poke-button/button-container.png';
  static const String _ContainerActiveAsset =
      'assets/images/menu/buttons/poke-button/button-container-active.png';

  static const String _BallAsset =
      'assets/images/menu/buttons/poke-button/party-ball.png';
  static const String _BallActiveAsset =
      'assets/images/menu/buttons/poke-button/party-ball-sel.png';

  static const String _FontFamily = 'Pixel';
  static const Color _ShadowColor = Color(0xFF787878);

  void _setPressed(bool value) {
    if (_isPressed == value) return;
    setState(() => _isPressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final borderAsset = _isPressed ? _BorderActiveAsset : _BorderAsset;
    final containerAsset = _isPressed ? _ContainerActiveAsset : _ContainerAsset;
    final ballAsset = _isPressed ? _BallActiveAsset : _BallAsset;

    Widget content = LayoutBuilder(
      builder: (context, constraints) {
        final double buttonHeight = constraints.maxHeight.isFinite
            ? constraints.maxHeight
            : _FallbackHeight;

        final double middleSectionHeight = buttonHeight * 0.55;

        final double bodyLeftPad = max(
          0.0,
          constraints.maxWidth * widget.bodyLeftPaddingFactor,
        );

        final double textLeftGap = max(
          0.0,
          constraints.maxWidth * widget.textLeftGapFactor,
        );

        final textStyle = TextStyle(
          fontFamily: _FontFamily,
          color: Colors.white,
          fontSize: middleSectionHeight * 0.55,
          height: 1.0,
          shadows: [
            Shadow(
              offset: Offset(middleSectionHeight * 0.06, 0),
              color: _ShadowColor,
              blurRadius: 0,
            ),
          ],
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
                          aspectRatio: _EdgeAspectRatio,
                          child: Transform(
                            alignment: Alignment.center,
                            transform: Matrix4.rotationY(pi),
                            child: Image.asset(
                              borderAsset,
                              fit: BoxFit.fill,
                              filterQuality: FilterQuality.none,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              image: DecorationImage(
                                image: AssetImage(containerAsset),
                                fit: BoxFit.fill,
                                filterQuality: FilterQuality.none,
                              ),
                            ),
                            child: Center(
                              child: Padding(
                                padding: EdgeInsets.only(
                                  left: textLeftGap,
                                  right: middleSectionHeight * 0.25,
                                ),
                                child: Text(
                                  widget.text,
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: textStyle,
                                ),
                              ),
                            ),
                          ),
                        ),
                        AspectRatio(
                          aspectRatio: _EdgeAspectRatio,
                          child: Image.asset(
                            borderAsset,
                            fit: BoxFit.fill,
                            filterQuality: FilterQuality.none,
                          ),
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
                child: Image.asset(
                  ballAsset,
                  fit: BoxFit.fitHeight,
                  filterQuality: FilterQuality.none,
                ),
              ),
            ],
          ),
        );
      },
    );

    if (widget.onTap != null) {
      content = GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => _setPressed(true),
        onTapUp: (_) => _setPressed(false),
        onTapCancel: () => _setPressed(false),
        onTap: widget.onTap,
        child: content,
      );
    }

    return content;
  }
}
