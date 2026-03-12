import 'dart:math' as math;

import 'package:client_mobile/widgets/stripe_painter/stripe_painter.dart';
import 'package:flutter/material.dart';

import 'stat_container_const.dart';

class StatContainer extends StatelessWidget {
  const StatContainer({super.key, required this.baseSize, this.child});

  final double baseSize;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final cornerSize = baseSize * STAT_CONTAINER_CORNER_SIZE_FACTOR;
    final sideEdgeWidth = cornerSize * STAT_CONTAINER_SIDE_EDGE_WIDTH_FACTOR;

    return SizedBox.expand(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final innerWidth = math.max(0.0, constraints.maxWidth - 2 * cornerSize);
          final middleHeight = math.max(0.0, constraints.maxHeight - 2 * cornerSize);
          final totalWidth = innerWidth + 2 * cornerSize;
          final inset = math.min(sideEdgeWidth, totalWidth / 2);

          return Column(
            children: [
              _TopEdge(cornerSize: cornerSize, innerWidth: innerWidth),
              SizedBox(
                height: middleHeight,
                child: ClipRect(
                  child: Stack(
                    children: [
                      Align(
                        alignment: Alignment.centerLeft,
                        child: SizedBox(
                          width: sideEdgeWidth,
                          height: double.infinity,
                          child: Transform.rotate(
                            angle: math.pi,
                            child: Container(
                              decoration: const BoxDecoration(
                                image: DecorationImage(
                                  image: AssetImage(STAT_CONTAINER_EDGE_2_ASSET),
                                  fit: BoxFit.fill,
                                  filterQuality: FilterQuality.none,
                                ),
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
                            decoration: const BoxDecoration(
                              image: DecorationImage(
                                image: AssetImage(STAT_CONTAINER_EDGE_2_ASSET),
                                fit: BoxFit.fill,
                                filterQuality: FilterQuality.none,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned.fill(
                        left: inset,
                        right: inset,
                        child: CustomPaint(
                          painter: StripePainter(
                            stripeSize: cornerSize * STAT_CONTAINER_CENTER_STRIPE_SIZE_FACTOR,
                            color1: STAT_CONTAINER_STRIPE_COLOR_1,
                            color2: STAT_CONTAINER_STRIPE_COLOR_2,
                          ),
                          child: child == null ? const SizedBox.expand() : SizedBox.expand(child: child),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              _BottomEdge(cornerSize: cornerSize, innerWidth: innerWidth),
            ],
          );
        },
      ),
    );
  }
}

class _TopEdge extends StatelessWidget {
  const _TopEdge({required this.cornerSize, required this.innerWidth});

  final double cornerSize;
  final double innerWidth;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: cornerSize,
          height: cornerSize,
          decoration: const BoxDecoration(
            image: DecorationImage(image: AssetImage(STAT_CONTAINER_BORDER_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
          ),
        ),
        SizedBox(
          width: innerWidth,
          height: cornerSize,
          child: Container(
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(STAT_CONTAINER_EDGE_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
            ),
          ),
        ),
        Container(
          width: cornerSize,
          height: cornerSize,
          decoration: const BoxDecoration(
            image: DecorationImage(image: AssetImage(STAT_CONTAINER_BORDER_2_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
          ),
        ),
      ],
    );
  }
}

class _BottomEdge extends StatelessWidget {
  const _BottomEdge({required this.cornerSize, required this.innerWidth});

  final double cornerSize;
  final double innerWidth;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Transform.rotate(
          angle: math.pi,
          child: Container(
            width: cornerSize,
            height: cornerSize,
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(STAT_CONTAINER_BORDER_2_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
            ),
          ),
        ),
        SizedBox(
          width: innerWidth,
          height: cornerSize,
          child: Transform.rotate(
            angle: math.pi,
            child: Container(
              decoration: const BoxDecoration(
                image: DecorationImage(image: AssetImage(STAT_CONTAINER_EDGE_ASSET), fit: BoxFit.fill, filterQuality: FilterQuality.none),
              ),
            ),
          ),
        ),
        Transform.rotate(
          angle: math.pi,
          child: Container(
            width: cornerSize,
            height: cornerSize,
            decoration: const BoxDecoration(
              image: DecorationImage(image: AssetImage(STAT_CONTAINER_BORDER_ASSET), fit: BoxFit.cover, filterQuality: FilterQuality.none),
            ),
          ),
        ),
      ],
    );
  }
}
