import 'package:flutter/material.dart';

class StripePainter extends CustomPainter {
  final double stripeSize;
  final double stripeSize2;
  final Color color1;
  final Color color2;

  StripePainter({required this.stripeSize, double? stripeSize2, required this.color1, required this.color2})
    : stripeSize2 = stripeSize2 ?? stripeSize;

  @override
  void paint(Canvas canvas, Size size) {
    final backgroundPaint = Paint()..color = color1;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), backgroundPaint);

    double y = 0;
    bool isColor1 = true;

    while (y < size.height) {
      final paint = Paint()..color = isColor1 ? color1 : color2;
      final currentStripeSize = isColor1 ? stripeSize : stripeSize2;
      canvas.drawRect(Rect.fromLTWH(0, y, size.width, currentStripeSize), paint);
      y += currentStripeSize;
      isColor1 = !isColor1;
    }
  }

  @override
  bool shouldRepaint(StripePainter oldDelegate) => false;
}
