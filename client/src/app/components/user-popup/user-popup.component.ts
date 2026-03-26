import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy } from '@angular/core';
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
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@common/consts/player-data.const';
import { RelationshipType, SocialListTab } from '@common/interfaces/social';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DEBOUNCE_TIME_MS } from '@app/consts/social.const';

@Component({
    selector: 'app-user-popup',
    templateUrl: './user-popup.component.html',
    styleUrls: ['./user-popup.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
})
export class UserPopupComponent implements OnDestroy {
    @Input() avatarImage: string = 'assets/images/menu/fullAvatars/fullAvatar0.png';
    readonly maxNameLength = MAX_NAME_LENGTH;
    userService: UserService = inject(UserService);
    currentUser: UserInfo | null = null;
    userCardType = UserCardType;
    activeCard: UserCardType = UserCardType.Front;
    animationsEnabled = false;
    oldPassword: string = '';
    newPassword: string = '';
    confirmNewPassword: string = '';
    newUsername: string = '';
    passwordError: string = '';
    usernameError: string = '';
    isUpdatingPassword = false;
    isUpdatingUsername = false;
    friendsTab = SocialListTab;
    relationshipType = RelationshipType;
    readonly socialService: SocialService = inject(SocialService);
    private readonly searchDebounceMs = DEBOUNCE_TIME_MS;
    private readonly searchSubject: Subject<string> = new Subject<string>();
    private searchSub?: Subscription;
    private popupService: PopupService = inject(PopupService);
    private readonly preferencesService: PreferencesService = inject(PreferencesService);
    private readonly translateService: TranslateService = inject(TranslateService);
    private readonly audioService: AudioService = inject(AudioService);

    constructor() {
        this.userService.user$.subscribe((user: UserInfo | null) => {
            this.currentUser = user;
            if (user) {
                this.newUsername = user.username;
            } else {
                this.resetForms();
            }
        });

        this.searchSub = this.searchSubject.pipe(debounceTime(this.searchDebounceMs), distinctUntilChanged()).subscribe((value) => {
            this.socialService.setSearchQuery(value);
        });
    }

    get avatarToDisplay(): string {
        return this.currentUser?.fullProfilePicture || this.currentUser?.profilePicture || this.avatarImage;
    }

    onSearchInput(value: string): void {
        this.searchSubject.next(value ?? '');
    }

    ngOnDestroy(): void {
        this.searchSub?.unsubscribe();
        this.searchSubject.complete();
    }

    openCard(card: UserCardType): void {
        this.audioService.playEffect(SoundEffect.Click);
        if (!this.currentUser) return;

        if (!this.animationsEnabled) {
            this.animationsEnabled = true;
        }

        this.activeCard = card;

        if (card === UserCardType.Friends && this.currentUser) {
            this.socialService.initialize(this.currentUser.userId);
        }

        this.usernameError = '';
        this.passwordError = '';
        this.newUsername = this.currentUser.username;
    }

    switchTab(tab: SocialListTab): void {
        this.socialService.setActiveTab(tab);
    }

    goToFront(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.activeCard = UserCardType.Front;
        this.resetForms();
    }

    updateUsername(): void {
        this.audioService.playEffect(SoundEffect.Click);
        if (!this.currentUser) return;
        this.usernameError = '';
        const sanitizedUsername = (this.newUsername || '').toUpperCase().trim();
        if (!sanitizedUsername) {
            this.usernameError = this.translateService.instant('components.userPopup.usernameRequired');
            return;
        }
        if (sanitizedUsername.length < MIN_NAME_LENGTH || sanitizedUsername.length > MAX_NAME_LENGTH) {
            this.usernameError = this.translateService.instant('popup.usernameLength');
            return;
        }
        if (sanitizedUsername === this.currentUser.username) {
            this.usernameError = this.translateService.instant('components.userPopup.usernameUnchanged');
            return;
        }
        this.popupService.showPopup({
            message: 'components.userPopup.confirmUsernameChange',
            hasCloseButton: true,
            isConfirmation: true,
            action: () => this.confirmUsernameUpdate(sanitizedUsername),
        });
    }

    editPassword(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.passwordError = '';
        if (!this.currentUser) return;
        const oldPwd = this.oldPassword.trim();
        const newPwd = this.newPassword.trim();
        const confirmPwd = this.confirmNewPassword.trim();
        if (!oldPwd || !newPwd || !confirmPwd) {
            this.passwordError = this.translateService.instant('components.userPopup.passwordFieldsRequired');
            return;
        }
        if (newPwd !== confirmPwd) {
            this.passwordError = this.translateService.instant('components.userPopup.passwordMismatch');
            return;
        }
        if (oldPwd === newPwd) {
            this.passwordError = this.translateService.instant('components.userPopup.passwordUnchanged');
            return;
        }
        this.isUpdatingPassword = true;
        this.userService.edit(this.currentUser.userId, { oldPassword: oldPwd, password: newPwd }).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.oldPassword = '';
                this.newPassword = '';
                this.confirmNewPassword = '';
                this.isUpdatingPassword = false;
                this.popupService.showPopup({
                    message: PopupMessage.ChangeConfirmed,
                    hasCloseButton: true,
                    isConfirmation: false,
                    popupColor: PopupColor.Green,
                });
            },
            error: (err) => {
                this.passwordError = err?.error?.message || this.translateService.instant('components.userPopup.passwordChangeError');
                this.isUpdatingPassword = false;
            },
        });
    }

    logout(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.popupService.showPopup({
            message: PopupMessage.LogoutConfirmation,
            hasCloseButton: true,
            isConfirmation: true,
            action: () => this.confirmLogout(),
        });
    }

    deleteAccount(): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.popupService.showPopup({
            message: PopupMessage.DeleteAccountConfirmation,
            hasCloseButton: true,
            isConfirmation: true,
            action: () => this.confirmDelete(),
        });
    }

    private confirmUsernameUpdate(sanitizedUsername: string): void {
        if (!this.currentUser) return;
        this.isUpdatingUsername = true;
        this.userService.edit(this.currentUser.userId, { username: sanitizedUsername }).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.newUsername = user.username;
                this.isUpdatingUsername = false;
                this.popupService.showPopup({
                    message: PopupMessage.ChangeConfirmed,
                    hasCloseButton: true,
                    isConfirmation: false,
                    popupColor: PopupColor.Green,
                });
            },
            error: (err) => {
                this.usernameError = err?.error?.message || this.translateService.instant('components.userPopup.usernameUpdateError');
                this.isUpdatingUsername = false;
            },
        });
    }

    private resetForms(): void {
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.passwordError = '';
        this.usernameError = '';
        this.isUpdatingPassword = false;
        this.isUpdatingUsername = false;
        this.newUsername = this.currentUser?.username ?? '';
        this.socialService.setActiveTab(SocialListTab.Search);
        this.socialService.setSearchQuery('');
    }

    private confirmLogout(): void {
        this.userService.logout().subscribe({
            next: () => {
                this.preferencesService.resetPreferences();
                this.userService.setUser(null);
            },
        });
    }

    private confirmDelete(): void {
        if (!this.currentUser) return;
        this.userService.delete(this.currentUser.userId).subscribe({
            next: () => {
                this.activeCard = UserCardType.Front;
                this.userService.setUser(null);
            },
        });
    }
}
