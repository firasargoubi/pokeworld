import 'package:client_mobile/services/audio_service/audio_service.dart';
import 'package:client_mobile/services/audio_service/audio_service_const.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const MethodChannel globalChannel = MethodChannel(
    'xyz.luan/audioplayers.global',
  );
  const MethodChannel playerChannel = MethodChannel('xyz.luan/audioplayers');

  Future<dynamic> audioPlayersHandler(MethodCall call) async {
    switch (call.method) {
      case 'init':
        return null;

      case 'create':
        return 'test-player-id';

      case 'dispose':
      case 'release':
      case 'resume':
      case 'stop':
      case 'pause':
      case 'seek':
      case 'setVolume':
      case 'setBalance':
      case 'setPlaybackRate':
      case 'setReleaseMode':
      case 'setPlayerMode':
      case 'setAudioContext':
      case 'setSourceUrl':
      case 'setSourceDeviceFile':
      case 'setSourceBytes':
      case 'setSourceAsset':
      case 'resumeAllPlayers':
      case 'stopAllPlayers':
        return null;

      case 'getCurrentPosition':
      case 'getDuration':
        return 0;

      case 'getPlayerState':
        return 0;

      default:
        return null;
    }
  }

  setUpAll(() async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(globalChannel, audioPlayersHandler);

    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(playerChannel, audioPlayersHandler);
  });

  tearDownAll(() async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(globalChannel, null);

    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(playerChannel, null);
  });

  group('AudioService', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('init should load saved volumes from shared preferences', () async {
      SharedPreferences.setMockInitialValues({
        BACKGROUND_VOLUME_PREFERENCE_KEY: 0.7,
        EFFECTS_VOLUME_PREFERENCE_KEY: 0.3,
      });

      final audioService = AudioService();
      await audioService.init();

      expect(audioService.backgroundVolume.value, equals(0.7));
      expect(audioService.effectsVolume.value, equals(0.3));
    });

    test('setBackgroundVolume should update backgroundVolume', () async {
      final audioService = AudioService();
      await audioService.setBackgroundVolume(0.4);

      expect(audioService.backgroundVolume.value, equals(0.4));
    });

    test(
      'setBackgroundVolume should clamp backgroundVolume to 1.0 when value is too high',
      () async {
        final audioService = AudioService();
        await audioService.setBackgroundVolume(5.0);

        expect(audioService.backgroundVolume.value, equals(1.0));
      },
    );

    test(
      'setBackgroundVolume should clamp backgroundVolume to 0.0 when value is negative',
      () async {
        final audioService = AudioService();
        await audioService.setBackgroundVolume(-2.0);

        expect(audioService.backgroundVolume.value, equals(0.0));
      },
    );

    test(
      'setBackgroundVolume should save backgroundVolume in shared preferences',
      () async {
        final audioService = AudioService();
        await audioService.setBackgroundVolume(0.65);

        final preferences = await SharedPreferences.getInstance();
        expect(
          preferences.getDouble(BACKGROUND_VOLUME_PREFERENCE_KEY),
          equals(0.65),
        );
      },
    );

    test('setEffectsVolume should update effectsVolume', () async {
      final audioService = AudioService();
      await audioService.setEffectsVolume(0.55);

      expect(audioService.effectsVolume.value, equals(0.55));
    });

    test(
      'setEffectsVolume should clamp effectsVolume to 1.0 when value is too high',
      () async {
        final audioService = AudioService();
        await audioService.setEffectsVolume(3.0);

        expect(audioService.effectsVolume.value, equals(1.0));
      },
    );

    test(
      'setEffectsVolume should clamp effectsVolume to 0.0 when value is negative',
      () async {
        final audioService = AudioService();
        await audioService.setEffectsVolume(-1.0);

        expect(audioService.effectsVolume.value, equals(0.0));
      },
    );

    test(
      'setEffectsVolume should save effectsVolume in shared preferences',
      () async {
        final audioService = AudioService();
        await audioService.setEffectsVolume(0.25);

        final preferences = await SharedPreferences.getInstance();
        expect(
          preferences.getDouble(EFFECTS_VOLUME_PREFERENCE_KEY),
          equals(0.25),
        );
      },
    );
  });
}