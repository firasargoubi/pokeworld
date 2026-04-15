import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { UserService } from '@app/services/user/user.service';
import { AppLanguage, AppTheme, DEFAULT_PREFERENCES, MenuMusicVariant, PartyBallVariant, UserPreferences } from '@common/interfaces/preferences';
import { BackgroundMusic } from '@app/interfaces/sound-service';

@Injectable({
    providedIn: 'root',
})
export class PreferencesService {
    private readonly document: Document = inject(DOCUMENT);
    private readonly chatService: ChatService = inject(ChatService);
    private readonly i18nService: I18nService = inject(I18nService);
    private readonly userService: UserService = inject(UserService);
    private currentPreferences: UserPreferences = { ...DEFAULT_PREFERENCES };
    private currentUserId: string | null = null;
    private readonly preAuthLanguageStorageKey = 'pre-auth-language';
    private readonly darkThemeClassName = 'app-theme-dark';
    private preAuthLanguage: AppLanguage = this.getStoredPreAuthLanguage();

    constructor() {
        this.currentPreferences = {
            ...DEFAULT_PREFERENCES,
            language: this.preAuthLanguage,
        };
        this.i18nService.initialize(this.currentPreferences.language);
        this.applyTheme(this.currentPreferences.theme);

        this.userService.user$.subscribe((user) => {
            if (user) {
                this.currentUserId = user.userId;
                this.currentPreferences = this.normalizePreferences(user.preferences);
                this.applyTheme(this.currentPreferences.theme);
                this.applyLanguage(this.currentPreferences.language);
                return;
            }

            this.currentUserId = null;
            this.currentPreferences = {
                ...DEFAULT_PREFERENCES,
                language: this.preAuthLanguage,
            };
            this.applyTheme(this.currentPreferences.theme);
            this.applyLanguage(this.currentPreferences.language);
        });
    }

    get currentTheme(): AppTheme {
        return this.currentPreferences.theme;
    }

    get currentLanguage(): AppLanguage {
        return this.currentPreferences.language;
    }

    get currentPartyBall(): PartyBallVariant {
        return this.currentPreferences.partyBall;
    }

    get currentMenuMusic(): MenuMusicVariant {
        return this.currentPreferences.menuMusic ?? MenuMusicVariant.Zero;
    }

    setLanguageBeforeAuth(language: AppLanguage): void {
        this.preAuthLanguage = language;
        localStorage.setItem(this.preAuthLanguageStorageKey, language);
        if (this.currentUserId) {
            return;
        }

        this.currentPreferences = {
            ...this.currentPreferences,
            language,
        };
        this.applyLanguage(language);
    }

    syncAfterLogin(userId: string, preferences: UserPreferences): void {
        this.currentUserId = userId;
        this.currentPreferences = this.normalizePreferences(preferences);
        this.applyTheme(this.currentPreferences.theme);
        this.applyLanguage(this.currentPreferences.language);
    }

    setTheme(theme: AppTheme): void {
        const previousPreferences = { ...this.currentPreferences };
        this.currentPreferences = { ...this.currentPreferences, theme };
        this.applyTheme(theme);

        if (!this.currentUserId) {
            return;
        }

        this.userService.updatePreferences(this.currentUserId, { theme }).subscribe({
            next: (preferences) => {
                this.currentPreferences = this.normalizePreferences(preferences);
                this.applyTheme(this.currentPreferences.theme);
            },
            error: () => {
                this.currentPreferences = previousPreferences;
                this.applyTheme(previousPreferences.theme);
            },
        });
    }

    setLanguage(language: AppLanguage): void {
        const previousPreferences = { ...this.currentPreferences };
        this.currentPreferences = { ...this.currentPreferences, language };
        this.applyLanguage(language);

        if (!this.currentUserId) {
            this.setLanguageBeforeAuth(language);
            return;
        }

        this.userService.updatePreferences(this.currentUserId, { language }).subscribe({
            next: (preferences) => {
                this.currentPreferences = this.normalizePreferences(preferences);
                this.applyLanguage(this.currentPreferences.language);
            },
            error: () => {
                this.currentPreferences = previousPreferences;
                this.applyLanguage(previousPreferences.language);
            },
        });
    }

    setMenuMusic(menuMusic: MenuMusicVariant): void {
        const previousPreferences = { ...this.currentPreferences };
        this.currentPreferences = { ...this.currentPreferences, menuMusic };

        if (!this.currentUserId) {
            return;
        }

        this.userService.updatePreferences(this.currentUserId, { menuMusic }).subscribe({
            next: (preferences) => {
                this.currentPreferences = this.normalizePreferences(preferences);
            },
            error: () => {
                this.currentPreferences = previousPreferences;
            },
        });
    }

    getHomeMenuTrack(variant?: MenuMusicVariant): BackgroundMusic {
        const variantMap: Record<MenuMusicVariant, BackgroundMusic> = {
            [MenuMusicVariant.Zero]: BackgroundMusic.Home,
            [MenuMusicVariant.One]: BackgroundMusic.Home1,
            [MenuMusicVariant.Two]: BackgroundMusic.Home2,
            [MenuMusicVariant.Three]: BackgroundMusic.Home3,
        };
        return variantMap[variant ?? this.currentMenuMusic] ?? BackgroundMusic.Home;
    }

    setPartyBall(partyBall: PartyBallVariant): void {
        const previousPreferences = { ...this.currentPreferences };
        this.currentPreferences = { ...this.currentPreferences, partyBall };

        if (!this.currentUserId) {
            return;
        }

        this.userService.updatePreferences(this.currentUserId, { partyBall }).subscribe({
            next: (preferences) => {
                this.currentPreferences = this.normalizePreferences(preferences);
            },
            error: () => {
                this.currentPreferences = previousPreferences;
            },
        });
    }

    getPartyBallAsset(isActive = false): string {
        return this.getPartyBallAssetForVariant(this.currentPartyBall, isActive);
    }

    getPartyBallAssetForVariant(variant: PartyBallVariant, isActive = false): string {
        const selectedSuffix = isActive ? '-sel' : '';
        return `./assets/images/menu/buttons/poke-button/party-ball${selectedSuffix}-${variant}.png`;
    }

    resetPreferences(): void {
        this.currentUserId = null;
        this.currentPreferences = {
            ...DEFAULT_PREFERENCES,
            language: this.preAuthLanguage,
        };
        this.applyTheme(this.currentPreferences.theme);
        this.applyLanguage(this.currentPreferences.language);
    }

    private getStoredPreAuthLanguage(): AppLanguage {
        const storedLanguage = localStorage.getItem(this.preAuthLanguageStorageKey);
        if (storedLanguage === AppLanguage.French || storedLanguage === AppLanguage.English) {
            return storedLanguage;
        }

        return DEFAULT_PREFERENCES.language;
    }

    private normalizePreferences(preferences?: Partial<UserPreferences> | null): UserPreferences {
        return {
            theme: preferences?.theme ?? DEFAULT_PREFERENCES.theme,
            language: preferences?.language ?? DEFAULT_PREFERENCES.language,
            partyBall: preferences?.partyBall ?? DEFAULT_PREFERENCES.partyBall,
            menuMusic: preferences?.menuMusic ?? DEFAULT_PREFERENCES.menuMusic,
        };
    }

    private applyTheme(theme: AppTheme): void {
        this.applyThemeToDocument(this.document, theme);

        const detachedWindow = this.chatService.detachedWindow;
        if (detachedWindow && !detachedWindow.closed) {
            this.applyThemeToDocument(detachedWindow.document, theme);
        }
    }

    private applyThemeToDocument(targetDocument: Document, theme: AppTheme): void {
        const body = targetDocument.body;

        if (theme === AppTheme.Dark) {
            body.classList.add(this.darkThemeClassName);
            return;
        }

        body.classList.remove(this.darkThemeClassName);
    }

    private applyLanguage(language: AppLanguage): void {
        this.document.documentElement.lang = language;
        this.i18nService.use(language);
    }
}
