export enum AppLanguage {
    French = 'fr',
    English = 'en',
}

export enum AppTheme {
    Default = 'default',
    Dark = 'dark',
}

export interface UserPreferences {
    language: AppLanguage;
    theme: AppTheme;
}

export const DEFAULT_PREFERENCES : UserPreferences = {
    language: AppLanguage.French,
    theme: AppTheme.Default,
}
