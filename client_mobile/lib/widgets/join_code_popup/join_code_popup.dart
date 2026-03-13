import 'dart:ui';

import 'package:client_mobile/services/i18n_service/i18n_service.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'join_code_popup_const.dart';

class JoinCodePopup extends StatelessWidget {
  const JoinCodePopup({super.key, required this.baseSize, required this.controller, required this.onClose});

  final double baseSize;
  final TextEditingController controller;
  final VoidCallback onClose;

  List<Shadow> _textShadow(double offsetX) => [Shadow(offset: Offset(offsetX, 0), color: JOIN_CODE_POPUP_SHADOW_COLOR, blurRadius: 0)];

  TextStyle _labelStyle(double fontSize, double shadowOffsetX) =>
      TextStyle(fontFamily: JOIN_CODE_POPUP_FONT_FAMILY, color: Colors.white, fontSize: fontSize, height: 0.9, shadows: _textShadow(shadowOffsetX));

  @override
  Widget build(BuildContext context) {
    final i18n = I18nService();
    final dialogHeight = baseSize * 0.60;
    final dialogWidth = dialogHeight * 16 / 9;
    final padding = baseSize * 0.065;

    final titleStyle = _labelStyle(baseSize * 0.05, baseSize * 0.005);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onClose,
      child: Stack(
        children: [
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
            child: Container(color: Colors.black.withValues(alpha: 0.5)),
          ),
          Center(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {},
              child: SizedBox(
                height: dialogHeight,
                width: dialogWidth,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(JOIN_CODE_POPUP_CONTAINER_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                    Padding(
                      padding: EdgeInsets.all(padding),
                      child: Column(
                        children: [
                          Expanded(
                            flex: 1,
                            child: Center(child: Text(i18n.translate(JOIN_CODE_POPUP_TITLE_TEXT), style: titleStyle)),
                          ),
                          _OverlayCodeInput(baseSize: baseSize, controller: controller),
                          Expanded(
                            flex: 1,
                            child: Center(child: Text(i18n.translate(JOIN_CODE_POPUP_HINT_TEXT), style: titleStyle)),
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
      ),
    );
  }
}

class _OverlayCodeInput extends StatelessWidget {
  const _OverlayCodeInput({required this.baseSize, required this.controller});

  final double baseSize;
  final TextEditingController controller;

  List<Shadow> _textShadow(double offsetX) => [Shadow(offset: Offset(offsetX, 0), color: JOIN_CODE_POPUP_SHADOW_COLOR, blurRadius: 0)];

  @override
  Widget build(BuildContext context) {
    final fontSize = baseSize * 0.08;

    final textStyle = TextStyle(
      fontFamily: JOIN_CODE_POPUP_FONT_FAMILY,
      color: Colors.white,
      fontSize: fontSize,
      letterSpacing: baseSize * 0.01,
      height: 1.0,
      shadows: _textShadow(baseSize * 0.006),
    );

    final textPainter = TextPainter(
      text: TextSpan(text: JOIN_CODE_POPUP_MEASURE_TEXT, style: textStyle),
      textDirection: TextDirection.ltr,
      maxLines: 1,
    )..layout();

    final inputBlockWidth = textPainter.width + fontSize * 0.8;
    final inputBlockHeight = fontSize * 1.20;

    return Expanded(
      flex: 1,
      child: Center(
        child: SizedBox(
          width: inputBlockWidth,
          height: inputBlockHeight,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Align(
                alignment: Alignment.bottomLeft,
                child: Text(JOIN_CODE_POPUP_UNDERLINE_TEXT, style: textStyle),
              ),
              Positioned(
                left: 0,
                right: 0,
                bottom: fontSize * 0.18,
                child: TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.left,
                  maxLength: 4,
                  onSubmitted: (value) {
                    if (value.isNotEmpty) {
                      MatchService().joinMatch(value);
                    }
                  },
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(4)],
                  decoration: const InputDecoration(border: InputBorder.none, counterText: '', isCollapsed: true, contentPadding: EdgeInsets.zero),
                  style: textStyle,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class RightOnlyClipper extends CustomClipper<Rect> {
  const RightOnlyClipper({required this.cardWidth, required this.panelWidth});

  final double cardWidth;
  final double panelWidth;

  @override
  Rect getClip(Size size) {
    return Rect.fromLTWH(cardWidth, 0, panelWidth, size.height);
  }

  @override
  bool shouldReclip(covariant RightOnlyClipper oldClipper) {
    return oldClipper.cardWidth != cardWidth || oldClipper.panelWidth != panelWidth;
  }
}
