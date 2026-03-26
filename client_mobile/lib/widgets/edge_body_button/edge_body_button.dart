import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:flutter/material.dart';

class EdgeBodyButton extends StatefulWidget {
  const EdgeBodyButton({
    super.key,
    required this.leftEdgePath,
    required this.rightEdgePath,
    required this.bodyPath,
    this.onAction,
    this.child,
    this.opacity,
  });

  final String leftEdgePath;
  final String rightEdgePath;
  final String bodyPath;
  final double? opacity;
  final VoidCallback? onAction;
  final Widget? child;

  @override
  State<EdgeBodyButton> createState() => _EdgeBodyButtonState();
}

class _EdgeBodyButtonState extends State<EdgeBodyButton> {
  bool _isPressed = false;

  bool get _isInteractive => widget.onAction != null;

  void _setPressed(bool value) {
    if (!_isInteractive) return;
    setState(() {
      _isPressed = value;
      AudioService().playSoundEffect(SoundEffect.Select.path);
    });
  }

  @override
  Widget build(BuildContext context) {
    final Widget content = Stack(
      fit: StackFit.expand,
      children: [
        Row(
          children: [
            Image.asset(
              widget.leftEdgePath,
              fit: BoxFit.fitHeight,
              height: double.infinity,
              alignment: Alignment.centerLeft,
              filterQuality: FilterQuality.none,
              opacity: widget.opacity != null ? AlwaysStoppedAnimation(widget.opacity!) : null,
            ),
            Expanded(
              child: Image.asset(
                widget.bodyPath,
                fit: BoxFit.fill,
                height: double.infinity,
                filterQuality: FilterQuality.none,
                opacity: widget.opacity != null ? AlwaysStoppedAnimation(widget.opacity!) : null,
              ),
            ),
            Image.asset(
              widget.rightEdgePath,
              fit: BoxFit.fitHeight,
              height: double.infinity,
              alignment: Alignment.centerRight,
              filterQuality: FilterQuality.none,
              opacity: widget.opacity != null ? AlwaysStoppedAnimation(widget.opacity!) : null,
            ),
          ],
        ),
        if (widget.child != null) Center(child: widget.child!),
      ],
    );

    final Widget animatedContent = AnimatedScale(
      scale: _isPressed ? 0.97 : 1,
      duration: const Duration(milliseconds: 100),
      child: ColorFiltered(
        colorFilter: ColorFilter.matrix(<double>[
          _isPressed ? 0.85 : 1.0,
          0,
          0,
          0,
          0,
          0,
          _isPressed ? 0.85 : 1.0,
          0,
          0,
          0,
          0,
          0,
          _isPressed ? 0.85 : 1.0,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
        ]),
        child: content,
      ),
    );

    if (!_isInteractive) {
      return SizedBox.expand(child: animatedContent);
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: widget.onAction,
      onTapDown: (_) => _setPressed(true),
      onTapUp: (_) => _setPressed(false),
      onTapCancel: () => _setPressed(false),
      child: SizedBox.expand(child: animatedContent),
    );
  }
}
