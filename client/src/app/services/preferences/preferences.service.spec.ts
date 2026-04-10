import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { UserService } from '@app/services/user/user.service';
import { AppLanguage, AppTheme, DEFAULT_PREFERENCES } from '@common/interfaces/preferences';
import { UserInfo } from '@common/interfaces/user';
import { BehaviorSubject, of } from 'rxjs';
import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
    let service: PreferencesService;
    let userSubject: BehaviorSubject<UserInfo | null>;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let i18nServiceSpy: jasmine.SpyObj<I18nService>;
    let testDocument: Document;

    const preAuthStorageKey = 'pre-auth-language';

    beforeEach(() => {
        localStorage.removeItem(preAuthStorageKey);

        userSubject = new BehaviorSubject<UserInfo | null>(null);
        userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['updatePreferences'], {
            user$: userSubject.asObservable(),
        });
        chatServiceSpy = jasmine.createSpyObj<ChatService>('ChatService', [], {
            detachedWindow: null,
        });
        i18nServiceSpy = jasmine.createSpyObj<I18nService>('I18nService', ['initialize', 'use', 'translate']);
        testDocument = document.implementation.createHTMLDocument('test');

        TestBed.configureTestingModule({
            providers: [
                PreferencesService,
                { provide: UserService, useValue: userServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: I18nService, useValue: i18nServiceSpy },
                { provide: DOCUMENT, useValue: testDocument },
            ],
        });

        service = TestBed.inject(PreferencesService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize i18n with pre-auth language', () => {
        expect(i18nServiceSpy.initialize).toHaveBeenCalledWith(DEFAULT_PREFERENCES.language);
    });

    it('should set language before auth and persist locally', () => {
        service.setLanguageBeforeAuth(AppLanguage.English);

        expect(localStorage.getItem(preAuthStorageKey)).toBe(AppLanguage.English);
        expect(service.currentLanguage).toBe(AppLanguage.English);
        expect(i18nServiceSpy.use).toHaveBeenCalledWith(AppLanguage.English);
    });

    it('should sync preferences after login', () => {
        service.syncAfterLogin('user-1', { theme: AppTheme.Dark, language: AppLanguage.English });

        expect(service.currentTheme).toBe(AppTheme.Dark);
        expect(service.currentLanguage).toBe(AppLanguage.English);
        expect(testDocument.body.classList.contains('app-theme-dark')).toBeTrue();
        expect(i18nServiceSpy.use).toHaveBeenCalledWith(AppLanguage.English);
    });

    it('should patch theme when user is connected', () => {
        service.syncAfterLogin('user-2', { ...DEFAULT_PREFERENCES });
        userServiceSpy.updatePreferences.and.returnValue(
            of({
                theme: AppTheme.Dark,
                language: AppLanguage.French,
            }),
        );

        service.setTheme(AppTheme.Dark);

        expect(userServiceSpy.updatePreferences).toHaveBeenCalledWith('user-2', { theme: AppTheme.Dark });
        expect(service.currentTheme).toBe(AppTheme.Dark);
    });

    it('should patch language when user is connected', () => {
        service.syncAfterLogin('user-3', { ...DEFAULT_PREFERENCES });
        userServiceSpy.updatePreferences.and.returnValue(
            of({
                theme: AppTheme.Default,
                language: AppLanguage.English,
            }),
        );

        service.setLanguage(AppLanguage.English);

        expect(userServiceSpy.updatePreferences).toHaveBeenCalledWith('user-3', { language: AppLanguage.English });
        expect(service.currentLanguage).toBe(AppLanguage.English);
        expect(i18nServiceSpy.use).toHaveBeenCalledWith(AppLanguage.English);
    });

    it('should reset preferences and remove dark theme on logout reset', () => {
        service.syncAfterLogin('user-4', { theme: AppTheme.Dark, language: AppLanguage.English });

        service.resetPreferences();

        expect(service.currentTheme).toBe(AppTheme.Default);
        expect(testDocument.body.classList.contains('app-theme-dark')).toBeFalse();
    });

    it('should apply theme to detached chat window document', () => {
        const detachedDocument = document.implementation.createHTMLDocument('detached-chat');
        const detachedWindow = {
            closed: false,
            document: detachedDocument,
        } as unknown as Window;
        Object.defineProperty(chatServiceSpy, 'detachedWindow', {
            value: detachedWindow,
            writable: true,
        });

        service.setTheme(AppTheme.Dark);
        expect(detachedDocument.body.classList.contains('app-theme-dark')).toBeTrue();

        service.setTheme(AppTheme.Default);
        expect(detachedDocument.body.classList.contains('app-theme-dark')).toBeFalse();
    });
});
