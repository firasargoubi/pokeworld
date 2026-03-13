import 'package:audioplayers/audioplayers.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'audio_service_const.dart';

class AudioService {
  static final AudioService _instance = AudioService._internal();

  factory AudioService() => _instance;

  AudioService._internal();

  final AudioPlayer _backgroundPlayer = AudioPlayer();
  final AudioPlayer _soundEffectPlayer = AudioPlayer();

  final Map<String, AudioPlayer> _preloadedBackgroundPlayers = {};
  final Map<String, AudioPlayer> _preloadedSoundEffectPlayers = {};

  final List<AudioPlayer> _availableSoundEffectPlayers = [];
  final List<AudioPlayer> _activeSoundEffectPlayers = [];

  late AudioPlayer _activeBackgroundPlayer;

  final ValueNotifier<double> backgroundVolume = ValueNotifier<double>(DEFAULT_BACKGROUND_VOLUME);
  final ValueNotifier<double> effectsVolume = ValueNotifier<double>(DEFAULT_EFFECTS_VOLUME);

  String? _activeBackgroundPath;
  bool _isInitialized = false;

  Future<void> init() async {
    if (_isInitialized) {
      return;
    }

    _isInitialized = true;
    _activeBackgroundPlayer = _backgroundPlayer;

    await Future.wait([
      _backgroundPlayer.setReleaseMode(ReleaseMode.loop),
      _backgroundPlayer.setAudioContext(BACKGROUND_AUDIO_CONTEXT),
      _soundEffectPlayer.setReleaseMode(ReleaseMode.release),
      _soundEffectPlayer.setAudioContext(EFFECTS_AUDIO_CONTEXT),
    ]);

    final preferences = await SharedPreferences.getInstance();
    final savedBackgroundVolume = preferences.getDouble(BACKGROUND_VOLUME_PREFERENCE_KEY) ?? DEFAULT_BACKGROUND_VOLUME;
    final savedEffectsVolume = preferences.getDouble(EFFECTS_VOLUME_PREFERENCE_KEY) ?? DEFAULT_EFFECTS_VOLUME;

    backgroundVolume.value = savedBackgroundVolume;
    effectsVolume.value = savedEffectsVolume;

    await Future.wait([_backgroundPlayer.setVolume(savedBackgroundVolume), _soundEffectPlayer.setVolume(savedEffectsVolume)]);
  }

  Future<void> preloadAllAssets() async {
    await init();
    await Future.wait([_preloadSoundEffects(), _preloadBackgroundMusic()]);
  }

  Future<void> playBackgroundMusic(String assetPath, {Duration transitionDuration = DEFAULT_TRANSITION_DURATION}) async {
    await init();

    if (_activeBackgroundPath == assetPath && _activeBackgroundPlayer.state == PlayerState.playing) {
      return;
    }

    final previousBackgroundPlayer = _activeBackgroundPlayer;

    if (previousBackgroundPlayer.state == PlayerState.playing) {
      await _fadeVolume(player: previousBackgroundPlayer, startVolume: backgroundVolume.value, endVolume: 0.0, duration: transitionDuration);
    }

    await previousBackgroundPlayer.stop();

    final nextBackgroundPlayer = _preloadedBackgroundPlayers[assetPath] ?? _backgroundPlayer;

    _activeBackgroundPlayer = nextBackgroundPlayer;
    _activeBackgroundPath = assetPath;

    await _activeBackgroundPlayer.setVolume(0.0);

    if (identical(nextBackgroundPlayer, _backgroundPlayer)) {
      await _activeBackgroundPlayer.play(AssetSource(assetPath));
    } else {
      await _activeBackgroundPlayer.resume();
    }

    await _fadeVolume(player: _activeBackgroundPlayer, startVolume: 0.0, endVolume: backgroundVolume.value, duration: transitionDuration);
  }

  Future<void> playSoundEffect(String assetPath) async {
    await init();

    final player = await _getAvailableSoundEffectPlayer();

    await player.setVolume(effectsVolume.value);
    await player.play(AssetSource(assetPath));

    _activeSoundEffectPlayers.add(player);

    player.onPlayerComplete.listen((_) {
      _activeSoundEffectPlayers.remove(player);
      _availableSoundEffectPlayers.add(player);
    });
  }

  Future<AudioPlayer> _getAvailableSoundEffectPlayer() async {
    if (_availableSoundEffectPlayers.isNotEmpty) {
      return _availableSoundEffectPlayers.removeAt(0);
    }

    final player = AudioPlayer();
    await player.setReleaseMode(ReleaseMode.release);
    await player.setAudioContext(EFFECTS_AUDIO_CONTEXT);
    return player;
  }

  Future<void> setBackgroundVolume(double volume) async {
    await init();

    final normalizedVolume = volume.clamp(0.0, 1.0);
    backgroundVolume.value = normalizedVolume;

    await Future.wait([
      _backgroundPlayer.setVolume(normalizedVolume),
      _activeBackgroundPlayer.setVolume(normalizedVolume),
      ..._preloadedBackgroundPlayers.values.map((player) => player.setVolume(normalizedVolume)),
    ]);

    final preferences = await SharedPreferences.getInstance();
    await preferences.setDouble(BACKGROUND_VOLUME_PREFERENCE_KEY, normalizedVolume);
  }

  Future<void> setEffectsVolume(double volume) async {
    await init();

    final normalizedVolume = volume.clamp(0.0, 1.0);
    effectsVolume.value = normalizedVolume;

    await Future.wait([
      _soundEffectPlayer.setVolume(normalizedVolume),
      ..._preloadedSoundEffectPlayers.values.map((player) => player.setVolume(normalizedVolume)),
      ..._activeSoundEffectPlayers.map((player) => player.setVolume(normalizedVolume)),
      ..._availableSoundEffectPlayers.map((player) => player.setVolume(normalizedVolume)),
    ]);

    final preferences = await SharedPreferences.getInstance();
    await preferences.setDouble(EFFECTS_VOLUME_PREFERENCE_KEY, normalizedVolume);
  }

  Future<void> _preloadSoundEffects() async {
    for (final soundEffect in SoundEffect.values) {
      final assetPath = soundEffect.path;

      if (_preloadedSoundEffectPlayers.containsKey(assetPath)) {
        continue;
      }

      final player = AudioPlayer();
      _preloadedSoundEffectPlayers[assetPath] = player;

      try {
        await player.setAudioContext(EFFECTS_AUDIO_CONTEXT);
        await player.setVolume(effectsVolume.value);
        await player.setSource(AssetSource(assetPath));
      } catch (_) {}
    }
  }

  Future<void> _preloadBackgroundMusic() async {
    for (final backgroundMusic in BackgroundMusic.values) {
      final assetPath = backgroundMusic.path;

      if (_preloadedBackgroundPlayers.containsKey(assetPath)) {
        continue;
      }

      final player = AudioPlayer();
      _preloadedBackgroundPlayers[assetPath] = player;

      try {
        await player.setReleaseMode(ReleaseMode.loop);
        await player.setAudioContext(BACKGROUND_AUDIO_CONTEXT);
        await player.setVolume(0.0);
        await player.setSource(AssetSource(assetPath));
      } catch (_) {}
    }
  }

  Future<void> _fadeVolume({required AudioPlayer player, required double startVolume, required double endVolume, required Duration duration}) async {
    final stepDuration = Duration(microseconds: duration.inMicroseconds ~/ VOLUME_TRANSITION_STEPS);

    for (int step = 1; step <= VOLUME_TRANSITION_STEPS; step++) {
      final progress = step / VOLUME_TRANSITION_STEPS;
      final volume = startVolume + (endVolume - startVolume) * progress;
      await player.setVolume(volume.clamp(0.0, 1.0));
      await Future.delayed(stepDuration);
    }
  }
}
