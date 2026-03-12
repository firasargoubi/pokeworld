import 'dart:async';
import 'dart:io';
import 'dart:math';

import 'package:sensors_plus/sensors_plus.dart';

enum ShakeDirection { horizontal, vertical }

class ShakeEvent {
  final DateTime timestamp;
  final ShakeDirection direction;
  final double magnitude;
  final double axisStrength;
  final int countInBurst;

  ShakeEvent({
    required this.timestamp,
    required this.direction,
    required this.magnitude,
    required this.axisStrength,
    required this.countInBurst,
  });
}

class MotionDetectionService {
  static final MotionDetectionService _instance =
      MotionDetectionService._internal();
  factory MotionDetectionService() => _instance;
  MotionDetectionService._internal();

  StreamSubscription<AccelerometerEvent>? _sub;
  bool _isListening = false;

  // Low-pass gravity estimate used to derive linear acceleration from raw accelerometer.
  double _gravityX = 0;
  double _gravityY = 0;
  double _gravityZ = 0;

  final _shakeController = StreamController<ShakeEvent>.broadcast();
  Stream<ShakeEvent> get onShake => _shakeController.stream;

  static const double shakeThreshold = 3.2;
  static const double directionDominanceRatio = 1.25;
  static const int slopMs = 250;
  static const int burstResetMs = 1000;
  static const int minHitsForShake = 3;

  int _lastHitMsH = 0, _hitsH = 0;
  int _lastHitMsV = 0, _hitsV = 0;

  void startListening() {
    if (_isListening) return;

    // Skip on desktop platforms (Windows, macOS, Linux)
    if (Platform.isWindows || Platform.isMacOS || Platform.isLinux) {
      return;
    }

    _isListening = true;
    _sub = accelerometerEvents.listen(_detectDirectionalShakeFromAccelerometer);
  }

  void stopListening() {
    if (!_isListening) return;
    _isListening = false;
    _sub?.cancel();
    _sub = null;
  }

  void _detectDirectionalShakeFromAccelerometer(AccelerometerEvent e) {
    const alpha = 0.8;
    _gravityX = alpha * _gravityX + (1 - alpha) * e.x;
    _gravityY = alpha * _gravityY + (1 - alpha) * e.y;
    _gravityZ = alpha * _gravityZ + (1 - alpha) * e.z;

    final dx = e.x - _gravityX;
    final dy = e.y - _gravityY;
    final dz = e.z - _gravityZ;

    _detectDirectionalShake(dx, dy, dz);
  }

  void _detectDirectionalShake(double dx, double dy, double dz) {
    final nowMs = DateTime.now().millisecondsSinceEpoch;

    final ax = dx.abs();
    final ay = dy.abs();

    final mag = sqrt(dx * dx + dy * dy + dz * dz);
    if (mag < shakeThreshold) return;

    ShakeDirection? dir;
    double dominantAxis;

    if (ax >= ay * directionDominanceRatio) {
      dir = ShakeDirection.vertical;
      dominantAxis = ax;
    } else if (ay >= ax * directionDominanceRatio) {
      dir = ShakeDirection.horizontal;
      dominantAxis = ay;
    } else {
      return;
    }

    if (dir == ShakeDirection.horizontal) {
      _handleBurst(
        nowMs: nowMs,
        lastHitMs: _lastHitMsH,
        hits: _hitsH,
        onUpdate: (lm, h) {
          _lastHitMsH = lm;
          _hitsH = h;
        },
        dir: dir,
        mag: mag,
        dominantAxis: dominantAxis,
      );
    } else {
      _handleBurst(
        nowMs: nowMs,
        lastHitMs: _lastHitMsV,
        hits: _hitsV,
        onUpdate: (lm, h) {
          _lastHitMsV = lm;
          _hitsV = h;
        },
        dir: dir,
        mag: mag,
        dominantAxis: dominantAxis,
      );
    }
  }

  void _handleBurst({
    required int nowMs,
    required int lastHitMs,
    required int hits,
    required void Function(int newLastHitMs, int newHits) onUpdate,
    required ShakeDirection dir,
    required double mag,
    required double dominantAxis,
  }) {
    if (lastHitMs != 0 && (nowMs - lastHitMs) < slopMs) return;

    if (lastHitMs != 0 && (nowMs - lastHitMs) > burstResetMs) {
      hits = 0;
    }

    lastHitMs = nowMs;
    hits++;

    onUpdate(lastHitMs, hits);

    if (hits >= minHitsForShake) {
      _shakeController.add(
        ShakeEvent(
          timestamp: DateTime.now(),
          direction: dir,
          magnitude: mag,
          axisStrength: dominantAxis,
          countInBurst: hits,
        ),
      );

      onUpdate(lastHitMs, 0);
    }
  }

  bool get isListening => _isListening;

  void dispose() {
    stopListening();
    _shakeController.close();
  }
}
