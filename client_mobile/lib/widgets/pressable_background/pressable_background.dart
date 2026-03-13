import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:flutter/material.dart';

class PressableBackground extends StatefulWidget {
  final String backgroundAsset;
  final String activeBackgroundAsset;
  final VoidCallback onTap;

  final String? text;
  final TextStyle? textStyle;
  final TextStyle? activeTextStyle;

  final Widget? child;

  const PressableBackground({
    super.key,
    required this.backgroundAsset,
    required this.activeBackgroundAsset,
    required this.onTap,
    this.text,
    this.textStyle,
    this.activeTextStyle,
    this.child,
  });

  @override
  State<PressableBackground> createState() => _PressableBackgroundState();
}

class _PressableBackgroundState extends State<PressableBackground> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final currentAsset = _isPressed ? widget.activeBackgroundAsset : widget.backgroundAsset;

    final content = widget.text != null
        ? Center(child: Text(widget.text!, style: _isPressed ? (widget.activeTextStyle ?? widget.textStyle) : widget.textStyle))
        : (widget.child ?? const SizedBox.shrink());

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => {setState(() => _isPressed = true), AudioService().playSoundEffect(SoundEffect.Select.path)},
      onTapCancel: () => setState(() => _isPressed = false),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap();
      },
      child: SizedBox.expand(
        child: DecoratedBox(
          decoration: BoxDecoration(
            image: DecorationImage(image: AssetImage(currentAsset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
          ),
          child: content,
        ),
      ),
    );
  }
}
