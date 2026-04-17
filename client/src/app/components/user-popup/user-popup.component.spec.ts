/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PopupMessage } from '@app/consts/popup-message.const';
import { PopupColor } from '@app/interfaces/popup';
import { SoundEffect } from '@app/interfaces/sound-service';
import { UserCardType } from '@app/interfaces/user';
import { AudioService } from '@app/services/audio/audio.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { SocialService } from '@app/services/social/social.service';
import { UserService } from '@app/services/user/user.service';
import { DEFAULT_PREFERENCES, MenuMusicVariant, PartyBallVariant, UserPreferences } from '@common/interfaces/preferences';
import { ShopItemType } from '@common/interfaces/shop';
import { SocialListTab } from '@common/interfaces/social';
import { UserInfo } from '@common/interfaces/user';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { UserPopupComponent } from './user-popup.component';

@Pipe({ name: 'translate', standalone: true })
class MockTranslatePipe implements PipeTransform {
    transform(value: string): string {
        return value;
    }
}

describe('UserPopupComponent', () => {
    let component: UserPopupComponent;
    let fixture: ComponentFixture<UserPopupComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let socialServiceSpy: jasmine.SpyObj<SocialService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let preferencesServiceSpy: jasmine.SpyObj<PreferencesService>;
    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let translateServiceSpy: jasmine.SpyObj<TranslateService>;
    let mockUserSubject: Subject<UserInfo | null>;

    const mockUser: UserInfo = {
        userId: '123',
        username: 'TESTUSER',
        email: 'test@test.com',
        profilePicture: 'pic.png',
        fullProfilePicture: 'full.png',
        balance: 100,
        createdAt: new Date(),
        preferences: { ...DEFAULT_PREFERENCES } as UserPreferences,
        inventory: [],
        challenges: [],
    };

    beforeEach(async () => {
        mockUserSubject = new Subject<UserInfo | null>();
        userServiceSpy = jasmine.createSpyObj('UserService', ['edit', 'logout', 'delete', 'setUser'], { user$: mockUserSubject.asObservable() });
        socialServiceSpy = jasmine.createSpyObj('SocialService', ['initialize', 'setActiveTab', 'setSearchQuery']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        preferencesServiceSpy = jasmine.createSpyObj(
            'PreferencesService',
            ['resetPreferences', 'setPartyBall', 'setMenuMusic', 'getPartyBallAssetForVariant', 'getHomeMenuTrack'],
            { currentPartyBall: PartyBallVariant.Zero, currentMenuMusic: MenuMusicVariant.Zero },
        );
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playEffect', 'playBackgroundMusic']);
        translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant', 'get', 'stream']);

        translateServiceSpy.instant.and.callFake((key: string) => key);
        translateServiceSpy.get.and.callFake((key) => of(key));
        translateServiceSpy.stream.and.callFake((key) => of(key));
        (translateServiceSpy as any).onLangChange = of(null);
        preferencesServiceSpy.getPartyBallAssetForVariant.and.returnValue('./assets/images/menu/buttons/poke-button/party-ball-0.png');
        preferencesServiceSpy.getHomeMenuTrack.and.returnValue('menu' as any);
        userServiceSpy.edit.and.returnValue(of(mockUser));
        userServiceSpy.logout.and.returnValue(of(void 0));
        userServiceSpy.delete.and.returnValue(of(void 0));

        TestBed.overrideComponent(UserPopupComponent, {
            set: { imports: [CommonModule, FormsModule, MockTranslatePipe] },
        });

        await TestBed.configureTestingModule({
            imports: [UserPopupComponent],
            providers: [
                { provide: UserService, useValue: userServiceSpy },
                { provide: SocialService, useValue: socialServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: PreferencesService, useValue: preferencesServiceSpy },
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: TranslateService, useValue: translateServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UserPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set currentUser and newUsername when user$ emits a user', () => {
        mockUserSubject.next(mockUser);
        expect(component.currentUser).toEqual(mockUser);
        expect(component.newUsername).toBe(mockUser.username);
    });

    it('should reset forms when user$ emits null', () => {
        spyOn<any>(component, 'resetForms');
        mockUserSubject.next(null);
        expect(component.currentUser).toBeNull();
        expect(component['resetForms']).toHaveBeenCalled();
    });

    it('should return fullProfilePicture if available for avatarToDisplay', () => {
        component.currentUser = mockUser;
        expect(component.avatarToDisplay).toBe('full.png');
    });

    it('should return profilePicture if fullProfilePicture is not available', () => {
        component.currentUser = { ...mockUser, fullProfilePicture: '' };
        expect(component.avatarToDisplay).toBe('pic.png');
    });

    it('should return default avatarImage if currentUser is null', () => {
        component.currentUser = null;
        expect(component.avatarToDisplay).toBe('assets/images/menu/fullAvatars/fullAvatar0.png');
    });

    it('should emit search value and trigger socialService.setSearchQuery after debounce', fakeAsync(() => {
        component.onSearchInput('firas');
        tick(300);
        expect(socialServiceSpy.setSearchQuery).toHaveBeenCalledWith('firas');
    }));

    it('should not trigger socialService.setSearchQuery before debounce time', fakeAsync(() => {
        component.onSearchInput('firas');
        tick(299);
        expect(socialServiceSpy.setSearchQuery).not.toHaveBeenCalled();
        tick(1);
    }));

    it('should only trigger socialService.setSearchQuery once for identical rapid inputs', fakeAsync(() => {
        component.onSearchInput('firas');
        tick(100);
        component.onSearchInput('firas');
        tick(300);
        expect(socialServiceSpy.setSearchQuery).toHaveBeenCalledTimes(1);
    }));

    it('should unsubscribe from searchSubject on destroy', () => {
        const nextSpy = spyOn(component['searchSubject'], 'complete');
        const unsubSpy = spyOn(component['searchSub']!, 'unsubscribe');
        component.ngOnDestroy();
        expect(nextSpy).toHaveBeenCalled();
        expect(unsubSpy).toHaveBeenCalled();
    });

    it('should play click sound and open card', () => {
        component.currentUser = mockUser;
        component.openCard(UserCardType.Settings);
        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.activeCard).toBe(UserCardType.Settings);
        expect(component.animationsEnabled).toBeTrue();
        expect(component.newUsername).toBe(mockUser.username);
        expect(component.usernameError).toBe('');
        expect(component.passwordError).toBe('');
    });

    it('should initialize socialService if Friends card is opened', () => {
        component.currentUser = mockUser;
        component.openCard(UserCardType.Friends);
        expect(socialServiceSpy.initialize).toHaveBeenCalledWith(mockUser.userId);
    });

    it('should set active tab on socialService', () => {
        component.switchTab(SocialListTab.Blocked);
        expect(socialServiceSpy.setActiveTab).toHaveBeenCalledWith(SocialListTab.Blocked);
    });

    it('should go to front card and reset forms', () => {
        spyOn<any>(component, 'resetForms');
        component.goToFront();
        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.activeCard).toBe(UserCardType.Front);
        expect(component['resetForms']).toHaveBeenCalled();
    });

    it('should equip an owned party ball from inventory', () => {
        component.currentUser = {
            ...mockUser,
            inventory: [{ itemId: 'party-ball', price: 1000 }],
        };
        const inventoryItem = {
            id: 'party-ball',
            nameKey: 'components.shopPopup.items.partyBall1',
            price: 1000,
            type: ShopItemType.Button,
            variant: PartyBallVariant.One,
        };

        component.equipInventoryItem(inventoryItem);

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(preferencesServiceSpy.setPartyBall).toHaveBeenCalledWith(PartyBallVariant.One);
    });

    it('should use the normal party ball asset in inventory previews', () => {
        const inventoryItem = {
            id: 'party-ball',
            nameKey: 'components.shopPopup.items.partyBall1',
            price: 1000,
            type: ShopItemType.Button,
            variant: PartyBallVariant.One,
        };

        component.getInventoryItemPreview(inventoryItem);

        expect(preferencesServiceSpy.getPartyBallAssetForVariant).toHaveBeenCalledWith(PartyBallVariant.One, false);
    });

    it('should include the default party ball in inventory items', () => {
        expect(component.ownedButtonItems.some((item) => item.id === 'party-ball-0')).toBeTrue();
    });

    it('should include the default menu music in inventory items', () => {
        expect(component.ownedMusicItems.some((item) => item.id === 'menu-music-0')).toBeTrue();
    });

    it('should equip the default party ball from inventory', () => {
        const inventoryItem = {
            id: 'party-ball-0',
            nameKey: 'components.shopPopup.items.partyBall0',
            price: 0,
            type: ShopItemType.Button,
            variant: PartyBallVariant.Zero,
        };

        component.currentUser = mockUser;
        component.equipInventoryItem(inventoryItem);

        expect(preferencesServiceSpy.setPartyBall).toHaveBeenCalledWith(PartyBallVariant.Zero);
    });

    it('should equip the default menu music from inventory', () => {
        const inventoryItem = {
            id: 'menu-music-0',
            nameKey: 'components.shopPopup.items.menuMusic0',
            price: 0,
            type: ShopItemType.Music,
            variant: MenuMusicVariant.Zero,
        };

        component.currentUser = mockUser;
        component.equipInventoryItem(inventoryItem);

        expect(preferencesServiceSpy.setMenuMusic).toHaveBeenCalledWith(MenuMusicVariant.Zero);
    });

    it('should show error if new username is empty', () => {
        component.currentUser = mockUser;
        component.newUsername = '   ';
        component.updateUsername();
        expect(component.usernameError).toBe('components.userPopup.usernameRequired');
    });

    it('should show error if new username is too short', () => {
        component.currentUser = mockUser;
        component.newUsername = 'A';
        component.updateUsername();
        expect(component.usernameError).toBe('popup.usernameLength');
    });

    it('should show error if new username is identical to current', () => {
        component.currentUser = mockUser;
        component.newUsername = mockUser.username.toLowerCase();
        component.updateUsername();
        expect(component.usernameError).toBe('components.userPopup.usernameUnchanged');
    });

    it('should show confirmation popup for valid username update', () => {
        component.currentUser = mockUser;
        component.newUsername = 'VALIDNAME';
        component.updateUsername();
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
        const popupArgs = popupServiceSpy.showPopup.calls.mostRecent().args[0];
        expect(popupArgs.message).toBe('components.userPopup.confirmUsernameChange');

        spyOn<any>(component, 'confirmUsernameUpdate');
        popupArgs.action!();
        expect(component['confirmUsernameUpdate']).toHaveBeenCalledWith('VALIDNAME');
    });

    it('should successfully confirm username update', () => {
        component.currentUser = mockUser;
        component['confirmUsernameUpdate']('NEWNAME');
        expect(component.isUpdatingUsername).toBeFalse();
        expect(userServiceSpy.setUser).toHaveBeenCalledWith(mockUser);
        expect(component.newUsername).toBe(mockUser.username);
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith(
            jasmine.objectContaining({
                message: PopupMessage.ChangeConfirmed,
                popupColor: PopupColor.Green,
            }),
        );
    });

    it('should handle error during username update', () => {
        component.currentUser = mockUser;
        userServiceSpy.edit.and.returnValue(throwError(() => ({ error: { message: 'components.userPopup.usernameUpdateError' } })));
        component['confirmUsernameUpdate']('NEWNAME');
        expect(component.isUpdatingUsername).toBeFalse();
        expect(component.usernameError).toBe('components.userPopup.usernameUpdateError');
    });

    it('should handle error without message during username update', () => {
        component.currentUser = mockUser;
        userServiceSpy.edit.and.returnValue(throwError(() => ({})));
        component['confirmUsernameUpdate']('NEWNAME');
        expect(component.isUpdatingUsername).toBeFalse();
        expect(component.usernameError).toBe('components.userPopup.usernameUpdateError');
    });

    it('should show error if password fields are empty', () => {
        component.currentUser = mockUser;
        component.oldPassword = '';
        component.editPassword();
        expect(component.passwordError).toBe('components.userPopup.passwordFieldsRequired');
    });

    it('should show error if passwords mismatch', () => {
        component.currentUser = mockUser;
        component.oldPassword = 'old';
        component.newPassword = 'new';
        component.confirmNewPassword = 'new2';
        component.editPassword();
        expect(component.passwordError).toBe('components.userPopup.passwordMismatch');
    });

    it('should show error if old and new passwords are identical', () => {
        component.currentUser = mockUser;
        component.oldPassword = 'same';
        component.newPassword = 'same';
        component.confirmNewPassword = 'same';
        component.editPassword();
        expect(component.passwordError).toBe('components.userPopup.passwordUnchanged');
    });

    it('should successfully edit password', () => {
        component.currentUser = mockUser;
        component.oldPassword = 'old';
        component.newPassword = 'new';
        component.confirmNewPassword = 'new';
        component.editPassword();

        expect(userServiceSpy.edit).toHaveBeenCalledWith(mockUser.userId, { oldPassword: 'old', password: 'new' });
        expect(component.oldPassword).toBe('');
        expect(component.newPassword).toBe('');
        expect(component.confirmNewPassword).toBe('');
        expect(component.isUpdatingPassword).toBeFalse();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith(
            jasmine.objectContaining({
                message: PopupMessage.ChangeConfirmed,
                popupColor: PopupColor.Green,
            }),
        );
    });

    it('should handle error during edit password', () => {
        component.currentUser = mockUser;
        component.oldPassword = 'old';
        component.newPassword = 'new';
        component.confirmNewPassword = 'new';
        userServiceSpy.edit.and.returnValue(throwError(() => ({ error: { message: 'components.userPopup.passwordChangeError' } })));

        component.editPassword();
        expect(component.passwordError).toBe('components.userPopup.passwordChangeError');
        expect(component.isUpdatingPassword).toBeFalse();
    });

    it('should show logout confirmation popup', () => {
        component.logout();
        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();

        spyOn<any>(component, 'confirmLogout');
        popupServiceSpy.showPopup.calls.mostRecent().args[0].action!();
        expect(component['confirmLogout']).toHaveBeenCalled();
    });

    it('should process logout confirmation', () => {
        component['confirmLogout']();
        expect(userServiceSpy.logout).toHaveBeenCalled();
        expect(preferencesServiceSpy.resetPreferences).toHaveBeenCalled();
        expect(userServiceSpy.setUser).toHaveBeenCalledWith(null);
    });

    it('should show delete account confirmation popup', () => {
        component.deleteAccount();
        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();

        spyOn<any>(component, 'confirmDelete');
        popupServiceSpy.showPopup.calls.mostRecent().args[0].action!();
        expect(component['confirmDelete']).toHaveBeenCalled();
    });

    it('should process delete account confirmation', () => {
        component.currentUser = mockUser;
        component['confirmDelete']();
        expect(userServiceSpy.delete).toHaveBeenCalledWith(mockUser.userId);
        expect(component.activeCard).toBe(UserCardType.Front);
        expect(userServiceSpy.setUser).toHaveBeenCalledWith(null);
    });

    it('should not execute delete if currentUser is null', () => {
        component.currentUser = null;
        component['confirmDelete']();
        expect(userServiceSpy.delete).not.toHaveBeenCalled();
    });
});
