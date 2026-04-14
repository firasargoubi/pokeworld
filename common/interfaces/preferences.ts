export enum AppLanguage {
    French = 'fr',
    English = 'en',
}

export enum AppTheme {
    Default = 'default',
    Dark = 'dark',
}

export enum PartyBallVariant {
    Zero = '0',
    One = '1',
    Two = '2',
    Three = '3',
    Four = '4',
}

export enum MenuMusicVariant {
    Zero = '0',
    One = '1',
    Two = '2',
    Three = '3',
}

export interface UserPreferences {
    language: AppLanguage;
    theme: AppTheme;
    partyBall: PartyBallVariant;
    menuMusic: MenuMusicVariant;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    language: AppLanguage.French,
    theme: AppTheme.Default,
    partyBall: PartyBallVariant.Zero,
    menuMusic: MenuMusicVariant.Zero,
};

export const PARTY_BALL_VARIANTS: PartyBallVariant[] = [
    PartyBallVariant.Zero,
    PartyBallVariant.One,
    PartyBallVariant.Two,
    PartyBallVariant.Three,
    PartyBallVariant.Four,
];

export const MENU_MUSIC_VARIANTS: MenuMusicVariant[] = [MenuMusicVariant.Zero, MenuMusicVariant.One, MenuMusicVariant.Two, MenuMusicVariant.Three];
