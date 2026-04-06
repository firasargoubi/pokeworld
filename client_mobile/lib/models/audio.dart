enum BackgroundMusic {
  Menu('audio/music/menu.mp3'),
  Combat('audio/music/combat.mp3'),
  Play('audio/music/play.mp3');

  final String path;
  const BackgroundMusic(this.path);
}

enum SoundEffect {
  Attack('audio/effects/attack.wav'),
  Death('audio/effects/death.mp3'),
  Flee('audio/effects/flee.wav'),
  Heal('audio/effects/heal.wav'),
  Item('audio/effects/item.wav'),
  Select('audio/effects/select.wav'),
  Shiny('audio/effects/shiny.mp3'),
  Evolve('audio/effects/evolve.mp3'),
  Notification('audio/effects/notification.mp3');

  final String path;
  const SoundEffect(this.path);
}
