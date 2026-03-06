const int MAX_SELECTABLE_AVATAR_INDEX = 13;

enum Avatar {
  defaultAvatar,
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar1Shiny,
  avatar2Shiny,
  avatar3Shiny,
  avatar4Shiny,
  avatar5Shiny,
  avatar6Shiny,
  avatar7Shiny,
  avatar8Shiny,
  avatar9Shiny,
  avatar10Shiny,
  avatar11Shiny,
  avatar12Shiny,
  avatar1Evolved,
  avatar2Evolved,
  avatar3Evolved,
  avatar4Evolved,
  avatar5Evolved,
  avatar6Evolved,
  avatar7Evolved,
  avatar8Evolved,
  avatar9Evolved,
  avatar10Evolved,
  avatar11Evolved,
  avatar12Evolved,
  avatar1EvolvedShiny,
  avatar2EvolvedShiny,
  avatar3EvolvedShiny,
  avatar4EvolvedShiny,
  avatar5EvolvedShiny,
  avatar6EvolvedShiny,
  avatar7EvolvedShiny,
  avatar8EvolvedShiny,
  avatar9EvolvedShiny,
  avatar10EvolvedShiny,
  avatar11EvolvedShiny,
  avatar12EvolvedShiny,
  missingNo,
}

class AvatarData {
  final String name;
  final String image;
  final String imageFace;
  final String frontGif;
  final String backGif;

  const AvatarData({required this.name, required this.image, required this.imageFace, required this.frontGif, required this.backGif});
}

const Map<Avatar, AvatarData> AVATAR_DATA = {
  Avatar.defaultAvatar: AvatarData(
    name: 'Default',
    image: 'assets/images/game/avatars/default.png',
    imageFace: 'assets/images/game/avatars-faces/default.png',
    frontGif: 'assets/images/game/avatars-gifs/bulbasaur.gif',
    backGif: 'assets/images/game/avatars-gifs/bulbasaur-back.gif',
  ),

  Avatar.avatar1: AvatarData(
    name: 'Bulbizarre',
    image: 'assets/images/game/avatars/bulbasaur.png',
    imageFace: 'assets/images/game/avatars-faces/bulbasaur.png',
    frontGif: 'assets/images/game/avatars-gifs/bulbasaur.gif',
    backGif: 'assets/images/game/avatars-gifs/bulbasaur-back.gif',
  ),

  Avatar.avatar2: AvatarData(
    name: 'Carapuce',
    image: 'assets/images/game/avatars/squirtle.png',
    imageFace: 'assets/images/game/avatars-faces/squirtle.png',
    frontGif: 'assets/images/game/avatars-gifs/squirtle.gif',
    backGif: 'assets/images/game/avatars-gifs/squirtle-back.gif',
  ),

  Avatar.avatar3: AvatarData(
    name: 'Salamèche',
    image: 'assets/images/game/avatars/charmander.png',
    imageFace: 'assets/images/game/avatars-faces/charmander.png',
    frontGif: 'assets/images/game/avatars-gifs/charmander.gif',
    backGif: 'assets/images/game/avatars-gifs/charmander-back.gif',
  ),

  Avatar.avatar4: AvatarData(
    name: 'Pikachu',
    image: 'assets/images/game/avatars/pikachu.png',
    imageFace: 'assets/images/game/avatars-faces/pikachu.png',
    frontGif: 'assets/images/game/avatars-gifs/pikachu.gif',
    backGif: 'assets/images/game/avatars-gifs/pikachu-back.gif',
  ),

  Avatar.avatar5: AvatarData(
    name: 'Rondoudou',
    image: 'assets/images/game/avatars/jigglypuff.png',
    imageFace: 'assets/images/game/avatars-faces/jigglypuff.png',
    frontGif: 'assets/images/game/avatars-gifs/jigglypuff.gif',
    backGif: 'assets/images/game/avatars-gifs/jigglypuff-back.gif',
  ),

  Avatar.avatar6: AvatarData(
    name: 'Psykokwak',
    image: 'assets/images/game/avatars/psyduck.png',
    imageFace: 'assets/images/game/avatars-faces/psyduck.png',
    frontGif: 'assets/images/game/avatars-gifs/psyduck.gif',
    backGif: 'assets/images/game/avatars-gifs/psyduck-back.gif',
  ),

  Avatar.avatar7: AvatarData(
    name: 'Goupix',
    image: 'assets/images/game/avatars/vulpix.png',
    imageFace: 'assets/images/game/avatars-faces/vulpix.png',
    frontGif: 'assets/images/game/avatars-gifs/vulpix.gif',
    backGif: 'assets/images/game/avatars-gifs/vulpix-back.gif',
  ),

  Avatar.avatar8: AvatarData(
    name: 'Évoli',
    image: 'assets/images/game/avatars/eevee.png',
    imageFace: 'assets/images/game/avatars-faces/eevee.png',
    frontGif: 'assets/images/game/avatars-gifs/eevee.gif',
    backGif: 'assets/images/game/avatars-gifs/eevee-back.gif',
  ),

  Avatar.avatar9: AvatarData(
    name: 'Osselait',
    image: 'assets/images/game/avatars/cubone.png',
    imageFace: 'assets/images/game/avatars-faces/cubone.png',
    frontGif: 'assets/images/game/avatars-gifs/cubone.gif',
    backGif: 'assets/images/game/avatars-gifs/cubone-back.gif',
  ),

  Avatar.avatar10: AvatarData(
    name: 'Magicarpe',
    image: 'assets/images/game/avatars/magikarp.png',
    imageFace: 'assets/images/game/avatars-faces/magikarp.png',
    frontGif: 'assets/images/game/avatars-gifs/magikarp.gif',
    backGif: 'assets/images/game/avatars-gifs/magikarp-back.gif',
  ),

  Avatar.avatar11: AvatarData(
    name: 'Draco',
    image: 'assets/images/game/avatars/dragonair.png',
    imageFace: 'assets/images/game/avatars-faces/dragonair.png',
    frontGif: 'assets/images/game/avatars-gifs/dragonair.gif',
    backGif: 'assets/images/game/avatars-gifs/dragonair-back.gif',
  ),

  Avatar.avatar12: AvatarData(
    name: 'Mew',
    image: 'assets/images/game/avatars/mew.png',
    imageFace: 'assets/images/game/avatars-faces/mew.png',
    frontGif: 'assets/images/game/avatars-gifs/mew.gif',
    backGif: 'assets/images/game/avatars-gifs/mew-back.gif',
  ),

  // SHINY
  Avatar.avatar1Shiny: AvatarData(
    name: 'Bulbizarre',
    image: 'assets/images/game/avatars/shiny/bulbasaur-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/bulbasaur-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/bulbasaur-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/bulbasaur-shiny-back.gif',
  ),
  Avatar.avatar2Shiny: AvatarData(
    name: 'Carapuce',
    image: 'assets/images/game/avatars/shiny/squirtle-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/squirtle-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/squirtle-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/squirtle-shiny-back.gif',
  ),
  Avatar.avatar3Shiny: AvatarData(
    name: 'Salamèche',
    image: 'assets/images/game/avatars/shiny/charmander-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/charmander-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/charmander-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/charmander-shiny-back.gif',
  ),
  Avatar.avatar4Shiny: AvatarData(
    name: 'Pikachu',
    image: 'assets/images/game/avatars/shiny/pikachu-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/pikachu-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/pikachu-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/pikachu-shiny-back.gif',
  ),
  Avatar.avatar5Shiny: AvatarData(
    name: 'Rondoudou',
    image: 'assets/images/game/avatars/shiny/jigglypuff-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/jigglypuff-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/jigglypuff-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/jigglypuff-shiny-back.gif',
  ),
  Avatar.avatar6Shiny: AvatarData(
    name: 'Psykokwak',
    image: 'assets/images/game/avatars/shiny/psyduck-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/psyduck-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/psyduck-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/psyduck-shiny-back.gif',
  ),
  Avatar.avatar7Shiny: AvatarData(
    name: 'Goupix',
    image: 'assets/images/game/avatars/shiny/vulpix-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/vulpix-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/vulpix-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/vulpix-shiny-back.gif',
  ),
  Avatar.avatar8Shiny: AvatarData(
    name: 'Évoli',
    image: 'assets/images/game/avatars/shiny/eevee-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/eevee-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/eevee-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/eevee-shiny-back.gif',
  ),
  Avatar.avatar9Shiny: AvatarData(
    name: 'Osselait',
    image: 'assets/images/game/avatars/shiny/cubone-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/cubone-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/cubone-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/cubone-shiny-back.gif',
  ),
  Avatar.avatar10Shiny: AvatarData(
    name: 'Magicarpe',
    image: 'assets/images/game/avatars/shiny/magikarp-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/magikarp-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/magikarp-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/magikarp-shiny-back.gif',
  ),
  Avatar.avatar11Shiny: AvatarData(
    name: 'Draco',
    image: 'assets/images/game/avatars/shiny/dragonair-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/dragonair-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/dragonair-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/dragonair-shiny-back.gif',
  ),
  Avatar.avatar12Shiny: AvatarData(
    name: 'Mew',
    image: 'assets/images/game/avatars/shiny/mew-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/shiny/mew-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/shiny/mew-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/shiny/mew-shiny-back.gif',
  ),

  // EVOLVED
  Avatar.avatar1Evolved: AvatarData(
    name: 'Florizarre',
    image: 'assets/images/game/avatars/evolved/venusaur.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/venusaur.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/venusaur.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/venusaur-back.gif',
  ),
  Avatar.avatar2Evolved: AvatarData(
    name: 'Tortank',
    image: 'assets/images/game/avatars/evolved/blastoise.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/blastoise.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/blastoise.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/blastoise-back.gif',
  ),
  Avatar.avatar3Evolved: AvatarData(
    name: 'Dracaufeu',
    image: 'assets/images/game/avatars/evolved/charizard.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/charizard.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/charizard.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/charizard-back.gif',
  ),
  Avatar.avatar4Evolved: AvatarData(
    name: 'Raichu',
    image: 'assets/images/game/avatars/evolved/raichu.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/raichu.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/raichu.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/raichu-back.gif',
  ),
  Avatar.avatar5Evolved: AvatarData(
    name: 'Grodoudou',
    image: 'assets/images/game/avatars/evolved/wigglytuff.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/wigglytuff.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/wigglytuff.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/wigglytuff-back.gif',
  ),
  Avatar.avatar6Evolved: AvatarData(
    name: 'Akwakwak',
    image: 'assets/images/game/avatars/evolved/golduck.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/golduck.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/golduck.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/golduck-back.gif',
  ),
  Avatar.avatar7Evolved: AvatarData(
    name: 'Feunard',
    image: 'assets/images/game/avatars/evolved/ninetales.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/ninetales.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/ninetales.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/ninetales-back.gif',
  ),
  Avatar.avatar8Evolved: AvatarData(
    name: 'Pyroli',
    image: 'assets/images/game/avatars/evolved/flareon.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/flareon.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/flareon.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/flareon-back.gif',
  ),
  Avatar.avatar9Evolved: AvatarData(
    name: 'Ossatueur',
    image: 'assets/images/game/avatars/evolved/marowak.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/marowak.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/marowak.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/marowak-back.gif',
  ),
  Avatar.avatar10Evolved: AvatarData(
    name: 'Léviator',
    image: 'assets/images/game/avatars/evolved/gyarados.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/gyarados.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/gyarados.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/gyarados-back.gif',
  ),
  Avatar.avatar11Evolved: AvatarData(
    name: 'Dracolosse',
    image: 'assets/images/game/avatars/evolved/dragonite.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/dragonite.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/dragonite.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/dragonite-back.gif',
  ),
  Avatar.avatar12Evolved: AvatarData(
    name: 'Mewtwo',
    image: 'assets/images/game/avatars/evolved/mewtwo.png',
    imageFace: 'assets/images/game/avatars-faces/evolved/mewtwo.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved/mewtwo.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved/mewtwo-back.gif',
  ),

  // EVOLVED SHINY
  Avatar.avatar1EvolvedShiny: AvatarData(
    name: 'Florizarre',
    image: 'assets/images/game/avatars/evolved-shiny/venusaur-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/venusaur-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/venusaur-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/venusaur-shiny-back.gif',
  ),
  Avatar.avatar2EvolvedShiny: AvatarData(
    name: 'Tortank',
    image: 'assets/images/game/avatars/evolved-shiny/blastoise-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/blastoise-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/blastoise-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/blastoise-shiny-back.gif',
  ),
  Avatar.avatar3EvolvedShiny: AvatarData(
    name: 'Dracaufeu',
    image: 'assets/images/game/avatars/evolved-shiny/charizard-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/charizard-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/charizard-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/charizard-shiny-back.gif',
  ),
  Avatar.avatar4EvolvedShiny: AvatarData(
    name: 'Raichu',
    image: 'assets/images/game/avatars/evolved-shiny/raichu-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/raichu-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/raichu-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/raichu-shiny-back.gif',
  ),
  Avatar.avatar5EvolvedShiny: AvatarData(
    name: 'Grodoudou',
    image: 'assets/images/game/avatars/evolved-shiny/wigglytuff-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/wigglytuff-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/wigglytuff-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/wigglytuff-shiny-back.gif',
  ),
  Avatar.avatar6EvolvedShiny: AvatarData(
    name: 'Akwakwak',
    image: 'assets/images/game/avatars/evolved-shiny/golduck-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/golduck-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/golduck-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/golduck-shiny-back.gif',
  ),
  Avatar.avatar7EvolvedShiny: AvatarData(
    name: 'Feunard',
    image: 'assets/images/game/avatars/evolved-shiny/ninetales-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/ninetales-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/ninetales-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/ninetales-shiny-back.gif',
  ),
  Avatar.avatar8EvolvedShiny: AvatarData(
    name: 'Pyroli',
    image: 'assets/images/game/avatars/evolved-shiny/flareon-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/flareon-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/flareon-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/flareon-shiny-back.gif',
  ),
  Avatar.avatar9EvolvedShiny: AvatarData(
    name: 'Ossatueur',
    image: 'assets/images/game/avatars/evolved-shiny/marowak-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/marowak-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/marowak-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/marowak-shiny-back.gif',
  ),
  Avatar.avatar10EvolvedShiny: AvatarData(
    name: 'Léviator',
    image: 'assets/images/game/avatars/evolved-shiny/gyarados-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/gyarados-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/gyarados-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/gyarados-shiny-back.gif',
  ),
  Avatar.avatar11EvolvedShiny: AvatarData(
    name: 'Dracolosse',
    image: 'assets/images/game/avatars/evolved-shiny/dragonite-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/dragonite-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/dragonite-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/dragonite-shiny-back.gif',
  ),
  Avatar.avatar12EvolvedShiny: AvatarData(
    name: 'Mewtwo',
    image: 'assets/images/game/avatars/evolved-shiny/mewtwo-shiny.png',
    imageFace: 'assets/images/game/avatars-faces/evolved-shiny/mewtwo-shiny.png',
    frontGif: 'assets/images/game/avatars-gifs/evolved-shiny/mewtwo-shiny.gif',
    backGif: 'assets/images/game/avatars-gifs/evolved-shiny/mewtwo-shiny-back.gif',
  ),

  // MISSINGNO
  Avatar.missingNo: AvatarData(
    name: 'MissingNo',
    image: 'assets/images/game/avatars/default.png',
    imageFace: 'assets/images/game/avatars-faces/default.png',
    frontGif: 'assets/images/game/avatars-gifs/missingno.gif',
    backGif: 'assets/images/game/avatars-gifs/missingno.gif',
  ),
};
