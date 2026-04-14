export enum SoundEffect {
    Flee = 'flee',
    Death = 'death',
    Attack = 'attack',
    Heal = 'heal',
    Item = 'item',
    Click = 'click',
    Shiny = 'shiny',
    Evolve = 'evolve',
}

export enum BackgroundMusic {
    Home = 'menu0.mp3',
    Home1 = 'menu1.mp3',
    Home2 = 'menu2.mp3',
    Home3 = 'menu3.mp3',
    Play = 'play.mp3',
    Combat = 'combat.mp3',
    Edit = 'edit.mp3',
}

export interface AudioSettings {
    backgroundMusicVolume: number;
    effectsVolume: number;
    avatarsVolume: number;
}
