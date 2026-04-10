import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/ui.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:flutter/material.dart';

import '../cut_corner_container/cut_corner_container.dart';
import 'default_container_const.dart';

class DefaultContainer extends StatefulWidget {
  const DefaultContainer({super.key, required this.baseSize, this.config = const DefaultContainerConfig(), this.child, this.onTap, this.onClose});

  final double baseSize;
  final DefaultContainerConfig config;
  final Widget? child;
  final VoidCallback? onTap;
  final VoidCallback? onClose;

  @override
  State<DefaultContainer> createState() => _DefaultContainerState();
}

class _DefaultContainerState extends State<DefaultContainer> {
  bool _pressed = false;
  bool _closePressed = false;

  @override
  Widget build(BuildContext context) {
    final cfg = widget.config;
    final onTap = widget.onTap;
    final double borderWidth = widget.baseSize * cfg.borderWidthFactor;
    final double innerBorderWidth = widget.baseSize * cfg.innerBorderWidthFactor;
    final double separatorHeight = widget.baseSize * cfg.separatorHeightFactor;
    final double cornerGapSize = borderWidth * 0.5;

    final bool hasInnerBorder = cfg.innerBorderBottomRightColor != null && cfg.innerBorderTopLeftColor != null;
    final bool hasSplitBackground = cfg.backgroundTopColor != null && cfg.backgroundBottomColor != null && cfg.backgroundRatio != null;

    final Color bottomRightColor = hasInnerBorder ? (_pressed ? cfg.innerBorderTopLeftColor! : cfg.innerBorderBottomRightColor!) : Colors.transparent;
    final Color topLeftColor = hasInnerBorder ? (_pressed ? cfg.innerBorderBottomRightColor! : cfg.innerBorderTopLeftColor!) : Colors.transparent;

    Widget? decoration;

    if (hasInnerBorder) {
      decoration = Stack(
        children: [
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            height: innerBorderWidth,
            child: ColoredBox(color: bottomRightColor),
          ),
          Positioned(
            top: 0,
            right: 0,
            bottom: 0,
            width: innerBorderWidth,
            child: ColoredBox(color: bottomRightColor),
          ),
          Positioned(
            left: 0,
            top: 0,
            right: innerBorderWidth,
            height: innerBorderWidth,
            child: ColoredBox(color: topLeftColor),
          ),
          Positioned(
            left: 0,
            top: 0,
            bottom: innerBorderWidth,
            width: innerBorderWidth,
            child: ColoredBox(color: topLeftColor),
          ),
        ],
      );
    }

    if (hasSplitBackground) {
      final int topFlex = (cfg.backgroundRatio! * 1000).round();
      final int bottomFlex = ((1 - cfg.backgroundRatio!) * 1000).round();

      decoration = Stack(
        children: [
          Positioned.fill(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  flex: topFlex,
                  child: ColoredBox(color: cfg.backgroundTopColor!),
                ),
                SizedBox(
                  height: separatorHeight,
                  child: ColoredBox(color: cfg.backgroundBottomColor!),
                ),
                SizedBox(
                  height: separatorHeight,
                  child: ColoredBox(color: cfg.backgroundTopColor!),
                ),
                Expanded(
                  flex: bottomFlex,
                  child: ColoredBox(color: cfg.backgroundBottomColor!),
                ),
              ],
            ),
          ),
          if (decoration != null) Positioned.fill(child: decoration),
        ],
      );
    }

    Widget result = SizedBox.expand(
      child: Stack(
        children: [
          Positioned.fill(
            child: CutCornerBorderContainer(
              backgroundColor: cfg.backgroundTopColor ?? cfg.backgroundBottomColor ?? Colors.white,
              borderColor: cfg.borderColor,
              borderWidth: borderWidth,
              cornerGapSize: cornerGapSize,
              padding: EdgeInsets.all(0),
              child: decoration,
            ),
          ),
          if (widget.child != null) Positioned.fill(child: widget.child!),
          if (widget.onClose != null)
            Positioned(
              top: (innerBorderWidth + borderWidth) * (cfg.closeButtonTopFactor ?? 1.0),
              right: (innerBorderWidth + borderWidth) * (cfg.closeButtonRightFactor ?? 1.0),
              child: GestureDetector(
                onTapDown: (_) => setState(() => _closePressed = true),
                onTapUp: (_) {
                  setState(() => _closePressed = false);
                  widget.onClose!();
                },
                onTapCancel: () => setState(() => _closePressed = false),
                child: Opacity(
                  opacity: _closePressed ? 1.0 : 0.5,
                  child: Image.asset(
                    CLOSE_ICON_ASSET,
                    width: widget.baseSize * cfg.closeButtonFactor!,
                    height: widget.baseSize * cfg.closeButtonFactor!,
                    fit: BoxFit.cover,
                    filterQuality: FilterQuality.none,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
        ],
      ),
    );

    if (onTap != null) {
      result = GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) {
          setState(() => _pressed = false);
          AudioService().playSoundEffect(SoundEffect.Select.path);
          onTap();
        },
        onTapCancel: () => setState(() => _pressed = false),
        child: result,
      );
    }

    return result;
  }
}
