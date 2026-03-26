import 'dart:math' as math;

import 'package:client_mobile/models/menu_config.dart';
import 'package:client_mobile/widgets/stat_container/stat_container_const.dart';
import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';

class FramedContainer extends StatelessWidget {
  const FramedContainer({super.key, required this.baseSize, this.child, this.style = DEFAULT_STYLE});

  final double baseSize;
  final Widget? child;
  final FramedContainerStyle style;

  @override
  Widget build(BuildContext context) {
    final cornerSize = baseSize * style.cornerSizeFactor;
    final sideEdgeWidth = cornerSize * style.sideEdgeWidthFactor;

    return SizedBox.expand(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final innerWidth = math.max(0.0, constraints.maxWidth - 2 * cornerSize);
          final totalWidth = innerWidth + 2 * cornerSize;

          const overlap = 1.0;
          final inset = math.max(0.0, math.min(sideEdgeWidth, totalWidth / 2) - overlap);

          return SizedBox(
            width: constraints.maxWidth,
            height: constraints.maxHeight,
            child: Stack(
              children: [
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: cornerSize,
                  child: _TopEdge(cornerSize: cornerSize, innerWidth: innerWidth, style: style),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: cornerSize,
                  child: _BottomEdge(cornerSize: cornerSize, innerWidth: innerWidth, style: style),
                ),
                Positioned(
                  top: math.max(0.0, cornerSize - overlap),
                  bottom: math.max(0.0, cornerSize - overlap),
                  left: 0,
                  right: 0,
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Align(
                        alignment: Alignment.centerLeft,
                        child: SizedBox(
                          width: sideEdgeWidth,
                          height: double.infinity,
                          child: Transform.rotate(
                            angle: math.pi,
                            child: Container(
                              decoration: BoxDecoration(
                                image: DecorationImage(image: AssetImage(style.edge2Asset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Align(
                        alignment: Alignment.centerRight,
                        child: SizedBox(
                          width: sideEdgeWidth,
                          height: double.infinity,
                          child: Container(
                            decoration: BoxDecoration(
                              image: DecorationImage(image: AssetImage(style.edge2Asset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
                            ),
                          ),
                        ),
                      ),
                      Positioned.fill(
                        left: inset,
                        right: inset,
                        child: CustomPaint(
                          painter: StripePainter(
                            stripeSize: cornerSize * style.centerStripeSizeFactor,
                            color1: style.stripeColor1,
                            color2: style.stripeColor2,
                          ),
                          child: child == null ? const SizedBox.expand() : SizedBox.expand(child: child),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _TopEdge extends StatelessWidget {
  const _TopEdge({required this.cornerSize, required this.innerWidth, required this.style});

  final double cornerSize;
  final double innerWidth;
  final FramedContainerStyle style;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: cornerSize,
          height: cornerSize,
          child: Container(
            decoration: BoxDecoration(
              image: DecorationImage(image: AssetImage(style.borderAsset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
            ),
          ),
        ),
        SizedBox(
          width: innerWidth,
          height: cornerSize,
          child: Container(
            decoration: BoxDecoration(
              image: DecorationImage(image: AssetImage(style.edgeAsset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
            ),
          ),
        ),
        SizedBox(
          width: cornerSize,
          height: cornerSize,
          child: Container(
            decoration: BoxDecoration(
              image: DecorationImage(image: AssetImage(style.border2Asset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
            ),
          ),
        ),
      ],
    );
  }
}

class _BottomEdge extends StatelessWidget {
  const _BottomEdge({required this.cornerSize, required this.innerWidth, required this.style});

  final double cornerSize;
  final double innerWidth;
  final FramedContainerStyle style;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Transform.rotate(
          angle: math.pi,
          child: SizedBox(
            width: cornerSize,
            height: cornerSize,
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(image: AssetImage(style.border2Asset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
              ),
            ),
          ),
        ),
        SizedBox(
          width: innerWidth,
          height: cornerSize,
          child: Transform.rotate(
            angle: math.pi,
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(image: AssetImage(style.edgeAsset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
              ),
            ),
          ),
        ),
        Transform.rotate(
          angle: math.pi,
          child: SizedBox(
            width: cornerSize,
            height: cornerSize,
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(image: AssetImage(style.borderAsset), fit: BoxFit.fill, filterQuality: FilterQuality.none),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
