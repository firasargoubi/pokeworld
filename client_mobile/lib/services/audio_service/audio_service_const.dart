import 'package:audioplayers/audioplayers.dart';

const String BACKGROUND_VOLUME_PREFERENCE_KEY = 'audio_background_volume';
const String EFFECTS_VOLUME_PREFERENCE_KEY = 'audio_effects_volume';
const String AVATARS_VOLUME_PREFERENCE_KEY = 'audio_avatars_volume';

const double DEFAULT_BACKGROUND_VOLUME = 0.4;
const double DEFAULT_EFFECTS_VOLUME = 1.0;
const double DEFAULT_AVATARS_VOLUME = 0.8;

const Duration DEFAULT_TRANSITION_DURATION = Duration(milliseconds: 100);
const int VOLUME_TRANSITION_STEPS = 20;

// ignore: non_constant_identifier_names
final AudioContext BACKGROUND_AUDIO_CONTEXT = AudioContext(
  android: const AudioContextAndroid(audioFocus: AndroidAudioFocus.gain, usageType: AndroidUsageType.media, contentType: AndroidContentType.music),
  iOS: AudioContextIOS(category: AVAudioSessionCategory.ambient),
);

// ignore: non_constant_identifier_names
final AudioContext EFFECTS_AUDIO_CONTEXT = AudioContext(
  android: const AudioContextAndroid(
    audioFocus: AndroidAudioFocus.gainTransientMayDuck,
    usageType: AndroidUsageType.game,
    contentType: AndroidContentType.sonification,
  ),
  iOS: AudioContextIOS(category: AVAudioSessionCategory.ambient),
);

// ignore: non_constant_identifier_names
final AudioContext AVATARS_AUDIO_CONTEXT = AudioContext(
  android: const AudioContextAndroid(
    audioFocus: AndroidAudioFocus.gainTransientMayDuck,
    usageType: AndroidUsageType.game,
    contentType: AndroidContentType.sonification,
  ),
  iOS: AudioContextIOS(category: AVAudioSessionCategory.ambient),
);
