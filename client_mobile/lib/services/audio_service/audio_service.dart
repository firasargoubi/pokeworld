import 'package:audioplayers/audioplayers.dart';
import 'package:client_mobile/consts/avatar_data_const.dart';
import 'package:client_mobile/models/audio.dart';
import 'package:client_mobile/models/match_data.dart';
import 'package:client_mobile/services/preferences_service/preferences_service.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'audio_service_const.dart';

class AudioService {
  static final AudioService _instance = AudioService._internal();

  factory AudioService() => _instance;

  AudioService._internal();

  final AudioPlayer _backgroundPlayer = AudioPlayer();
  final AudioPlayer _soundEffectPlayer = AudioPlayer();
  final AudioPlayer _notificationPlayer = AudioPlayer();
  final AudioPlayer _avatarPlayer = AudioPlayer();

  final Map<String, AudioPlayer> _preloadedBackgroundPlayers = {};
  final Map<String, AudioPlayer> _preloadedSoundEffectPlayers = {};
  final Map<String, AudioPlayer> _preloadedAvatarPlayers = {};

  final List<AudioPlayer> _availableSoundEffectPlayers = [];
  final List<AudioPlayer> _activeSoundEffectPlayers = [];

  late AudioPlayer _activeBackgroundPlayer;

  final ValueNotifier<double> backgroundVolume = ValueNotifier<double>(DEFAULT_BACKGROUND_VOLUME);
  final ValueNotifier<double> effectsVolume = ValueNotifier<double>(DEFAULT_EFFECTS_VOLUME);
  final ValueNotifier<double> avatarsVolume = ValueNotifier<double>(DEFAULT_AVATARS_VOLUME);

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
      _notificationPlayer.setReleaseMode(ReleaseMode.release),
      _notificationPlayer.setAudioContext(EFFECTS_AUDIO_CONTEXT),
      _avatarPlayer.setReleaseMode(ReleaseMode.release),
      _avatarPlayer.setAudioContext(AVATARS_AUDIO_CONTEXT),
    ]);

    final preferences = await SharedPreferences.getInstance();
    final savedBackgroundVolume = preferences.getDouble(BACKGROUND_VOLUME_PREFERENCE_KEY) ?? DEFAULT_BACKGROUND_VOLUME;
    final savedEffectsVolume = preferences.getDouble(EFFECTS_VOLUME_PREFERENCE_KEY) ?? DEFAULT_EFFECTS_VOLUME;
    final savedAvatarsVolume = preferences.getDouble(AVATARS_VOLUME_PREFERENCE_KEY) ?? DEFAULT_AVATARS_VOLUME;
    backgroundVolume.value = savedBackgroundVolume;
    effectsVolume.value = savedEffectsVolume;
    avatarsVolume.value = savedAvatarsVolume;

    await Future.wait([
      _backgroundPlayer.setVolume(savedBackgroundVolume),
      _soundEffectPlayer.setVolume(savedEffectsVolume),
      _notificationPlayer.setVolume(savedEffectsVolume),
      _avatarPlayer.setVolume(savedAvatarsVolume),
    ]);
  }

  Future<void> preloadAllAssets() async {
    await init();
    await Future.wait([_preloadSoundEffects(), _preloadBackgroundMusic(), _preloadAvatarSounds()]);
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

  Future<void> playNotificationSoundEffect() async {
    await init();

    await _notificationPlayer.stop();
    await _notificationPlayer.setVolume(effectsVolume.value);
    await _notificationPlayer.play(AssetSource(SoundEffect.Notification.path));
  }

  Future<void> playAvatarSounds(List<String> assetPaths) async {
    await init();

    for (final assetPath in assetPaths) {
      final player = _preloadedAvatarPlayers[assetPath] ?? _avatarPlayer;
      await player.setVolume(avatarsVolume.value);

      if (identical(player, _avatarPlayer)) {
        await player.play(AssetSource(assetPath));
      } else {
        await player.seek(Duration.zero);
        await player.resume();
      }

      final duration = await player.getDuration() ?? const Duration(seconds: 3);
      await Future.any<void>([player.onPlayerComplete.first.then((_) {}), Future<void>.delayed(duration)]);
    }
  }

  Future<void> stopAllAudio() async {
    await init();

    await Future.wait([
      _activeBackgroundPlayer.pause(),
      _notificationPlayer.stop(),
      _avatarPlayer.stop(),
      ..._preloadedAvatarPlayers.values.map((player) => player.stop()),
      ..._activeSoundEffectPlayers.map((player) => player.stop()),
      ..._availableSoundEffectPlayers.map((player) => player.stop()),
    ]);

    _activeSoundEffectPlayers.clear();
  }

  Future<void> resumeBackgroundMusicIfNeeded() async {
    await init();

    final lastBackgroundPath = _activeBackgroundPath;
    if (lastBackgroundPath == null) {
      return;
    }

    if (_activeBackgroundPlayer.state == PlayerState.paused) {
      await _activeBackgroundPlayer.setVolume(backgroundVolume.value);
      await _activeBackgroundPlayer.resume();
      return;
    }

    await playBackgroundMusic(lastBackgroundPath, transitionDuration: Duration.zero);
  }

  Future<void> resumeBackgroundMusicForMatchState(MatchState? state) async {
    await init();

    final expectedBackgroundMusic = BACKGROUND_MUSIC_BY_MATCH_STATE[state];
    if (expectedBackgroundMusic == null) {
      await resumeBackgroundMusicIfNeeded();
      return;
    }

    final expectedMusicPath =
        expectedBackgroundMusic == BackgroundMusic.Menu ? PreferencesService().getEquippedMenuMusicPath() : expectedBackgroundMusic.path;

    await playBackgroundMusic(expectedMusicPath, transitionDuration: Duration.zero);
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
      _notificationPlayer.setVolume(normalizedVolume),
      ..._preloadedSoundEffectPlayers.values.map((player) => player.setVolume(normalizedVolume)),
      ..._activeSoundEffectPlayers.map((player) => player.setVolume(normalizedVolume)),
      ..._availableSoundEffectPlayers.map((player) => player.setVolume(normalizedVolume)),
    ]);

    final preferences = await SharedPreferences.getInstance();
    await preferences.setDouble(EFFECTS_VOLUME_PREFERENCE_KEY, normalizedVolume);
  }

  Future<void> setAvatarsVolume(double volume) async {
    await init();

    final normalizedVolume = volume.clamp(0.0, 1.0);
    avatarsVolume.value = normalizedVolume;

    await Future.wait([
      _avatarPlayer.setVolume(normalizedVolume),
      ..._preloadedAvatarPlayers.values.map((player) => player.setVolume(normalizedVolume)),
    ]);

    final preferences = await SharedPreferences.getInstance();
    await preferences.setDouble(AVATARS_VOLUME_PREFERENCE_KEY, normalizedVolume);
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

  Future<void> _preloadAvatarSounds() async {
    for (final assetPath in AVATAR_SOUNDS.values) {
      final player = AudioPlayer();
      _preloadedAvatarPlayers[assetPath] = player;

      try {
        await player.setReleaseMode(ReleaseMode.release);
        await player.setAudioContext(AVATARS_AUDIO_CONTEXT);
        await player.setVolume(avatarsVolume.value);
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
