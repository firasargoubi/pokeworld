import 'package:flutter/material.dart';

class StripePainter extends CustomPainter {
  final double stripeSize;
  final Color color1;
  final Color color2;

  StripePainter({
    required this.stripeSize,
    required this.color1,
    required this.color2,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Background
    final backgroundPaint = Paint()..color = color1;
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      backgroundPaint,
    );

    // Stripes
    double y = 0;
    bool isColor1 = true;

    while (y < size.height) {
      final paint = Paint()..color = isColor1 ? color1 : color2;
      canvas.drawRect(Rect.fromLTWH(0, y, size.width, stripeSize), paint);
      y += stripeSize;
      isColor1 = !isColor1;
    }
  }

  @override
  bool shouldRepaint(StripePainter oldDelegate) => false;
}
