import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { UserService } from '@app/services/user/user.service';
import { AppLanguage, AppTheme, DEFAULT_PREFERENCES, UserPreferences } from '@common/interfaces/preferences';

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
                this.currentPreferences = user.preferences ?? { ...DEFAULT_PREFERENCES };
                this.applyTheme(this.currentPreferences.theme);
                this.applyLanguage(this.currentPreferences.language);
                return;
            }

            this.currentUserId = null;
            this.currentPreferences = {
                theme: AppTheme.Default,
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
        this.currentPreferences = preferences ?? { ...DEFAULT_PREFERENCES };
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
                this.currentPreferences = preferences;
                this.applyTheme(preferences.theme);
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
                this.currentPreferences = preferences;
                this.applyLanguage(preferences.language);
            },
            error: () => {
                this.currentPreferences = previousPreferences;
                this.applyLanguage(previousPreferences.language);
            },
        });
    }

    resetPreferences(): void {
        this.currentUserId = null;
        this.currentPreferences = {
            theme: AppTheme.Default,
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
