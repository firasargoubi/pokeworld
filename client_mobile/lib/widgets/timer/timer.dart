import 'dart:async';
import 'dart:math';

import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/services/match_service/match_service.dart';
import 'package:flutter/material.dart';

import 'timer_const.dart';

class PlayTimerWidget extends StatefulWidget {
  const PlayTimerWidget({
    super.key,
    required this.height,
    required this.fontFamily,
    required this.shadowColor,
    this.durationSeconds = DEFAULT_TIMER_DURATION_SECONDS,
  });

  final double height;
  final String fontFamily;
  final Color shadowColor;
  final int durationSeconds;

  @override
  State<PlayTimerWidget> createState() => _PlayTimerWidgetState();
}

class _PlayTimerWidgetState extends State<PlayTimerWidget> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  StreamSubscription? _matchSubscription;
  MatchState? _previousState;

  static double? _savedProgress;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: widget.durationSeconds),
    );

    _previousState = MatchService().matchData?.state;

    if (_previousState == MatchState.TurnWait) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _resumeOrStart());
    }

    _matchSubscription = MatchService().matchUpdates.listen((updatedMatchData) {
      final state = updatedMatchData.state;

      if (_previousState == MatchState.TurnStart && state == MatchState.TurnWait) {
        _start();
      } else if (state == MatchState.TurnWait) {
        _resume();
      } else {
        _pause();
      }

      _previousState = state;
    });
  }

  @override
  void didUpdateWidget(covariant PlayTimerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.durationSeconds != widget.durationSeconds) {
      _controller.duration = Duration(seconds: widget.durationSeconds);
    }
  }

  @override
  void dispose() {
    _matchSubscription?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _start() {
    if (widget.durationSeconds <= 0) return;
    _savedProgress = null;
    _controller
      ..duration = Duration(seconds: widget.durationSeconds)
      ..reset()
      ..forward();
  }

  void _pause() {
    _savedProgress = _controller.value;
    _controller.stop();
  }

  void _resume() {
    if (_controller.isCompleted) return;
    if (_controller.value == 0.0) {
      _start();
      return;
    }
    _controller.forward();
  }

  void _resumeOrStart() {
    if (widget.durationSeconds <= 0) return;
    _controller.duration = Duration(seconds: widget.durationSeconds);
    final saved = _savedProgress;
    if (saved != null && saved > 0.0 && saved < 1.0) {
      _savedProgress = null;
      _controller.value = saved;
      _controller.forward();
    } else {
      _start();
    }
  }

  @override
  Widget build(BuildContext context) {
    final height = widget.height;

    return SizedBox(
      height: height,
      width: double.infinity,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final total = _controller.duration ?? Duration.zero;
          final remainingFactor = (1.0 - _controller.value).clamp(0.0, 1.0);
          final remaining = Duration(microseconds: (total.inMicroseconds * remainingFactor).round());

          return ClipRect(
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(TIMER_RIGHT_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final width = constraints.maxWidth;
                    final height = constraints.maxHeight;

                    final squareSize = height;
                    final minWidth = squareSize;
                    final maxWidth = width;

                    final progressWidth = minWidth + (maxWidth - minWidth) * remainingFactor;
                    final leftWidth = max(0.0, progressWidth - squareSize);

                    return Align(
                      alignment: Alignment.centerLeft,
                      child: SizedBox(
                        width: progressWidth,
                        height: height,
                        child: Row(
                          children: [
                            if (leftWidth > 0)
                              SizedBox(
                                width: leftWidth,
                                height: height,
                                child: Image.asset(TIMER_LEFT_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                              ),
                            SizedBox(
                              width: squareSize,
                              height: squareSize,
                              child: Image.asset(TIMER_CENTER_ASSET, fit: BoxFit.fill, filterQuality: FilterQuality.none),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                Center(
                  child: Text(
                    '${max(0, remaining.inSeconds)}',
                    style: TextStyle(
                      fontFamily: widget.fontFamily,
                      color: Colors.white,
                      fontSize: height * TIMER_TEXT_FONT_SIZE_FACTOR,
                      height: 1.0,
                      shadows: [Shadow(offset: Offset(height * TIMER_TEXT_SHADOW_OFFSET_FACTOR, 0), color: widget.shadowColor, blurRadius: 0)],
                    ),
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
