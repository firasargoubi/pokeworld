import 'package:flutter/material.dart';

class CutCornerBorderContainer extends StatelessWidget {
  const CutCornerBorderContainer({
    super.key,
    required this.backgroundColor,
    required this.borderColor,
    required this.borderWidth,
    this.cornerGapSize,
    this.padding,
    this.child,
  });

  final Color backgroundColor;
  final Color borderColor;
  final double borderWidth;
  final double? cornerGapSize;
  final EdgeInsetsGeometry? padding;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final double gap = cornerGapSize ?? borderWidth;

    return SizedBox.expand(
      child: CustomPaint(
        painter: _CutCornerBorderPainter(backgroundColor: backgroundColor, borderColor: borderColor, borderWidth: borderWidth, cornerGapSize: gap),
        child: Padding(padding: EdgeInsets.all(borderWidth).add(padding?.resolve(Directionality.of(context)) ?? EdgeInsets.zero), child: child),
      ),
    );
  }
}

class _CutCornerBorderPainter extends CustomPainter {
  const _CutCornerBorderPainter({required this.backgroundColor, required this.borderColor, required this.borderWidth, required this.cornerGapSize});

  final Color backgroundColor;
  final Color borderColor;
  final double borderWidth;
  final double cornerGapSize;

  @override
  void paint(Canvas canvas, Size size) {
    final double gap = cornerGapSize.clamp(0.0, size.shortestSide / 2);
    final double innerWidth = (size.width - 2 * borderWidth).clamp(0.0, double.infinity);
    final double innerHeight = (size.height - 2 * borderWidth).clamp(0.0, double.infinity);

    final Paint backgroundPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.fill;

    final Paint borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.fill;

    canvas.drawRect(Rect.fromLTWH(borderWidth, borderWidth, innerWidth, innerHeight), backgroundPaint);

    canvas.drawRect(Rect.fromLTWH(gap, 0, (size.width - 2 * gap).clamp(0.0, double.infinity), borderWidth), borderPaint);

    canvas.drawRect(Rect.fromLTWH(gap, size.height - borderWidth, (size.width - 2 * gap).clamp(0.0, double.infinity), borderWidth), borderPaint);

    canvas.drawRect(Rect.fromLTWH(0, gap, borderWidth, (size.height - 2 * gap).clamp(0.0, double.infinity)), borderPaint);

    canvas.drawRect(Rect.fromLTWH(size.width - borderWidth, gap, borderWidth, (size.height - 2 * gap).clamp(0.0, double.infinity)), borderPaint);
  }

  @override
  bool shouldRepaint(covariant _CutCornerBorderPainter oldDelegate) {
    return oldDelegate.backgroundColor != backgroundColor ||
        oldDelegate.borderColor != borderColor ||
        oldDelegate.borderWidth != borderWidth ||
        oldDelegate.cornerGapSize != cornerGapSize;
  }
}
