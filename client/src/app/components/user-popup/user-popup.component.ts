import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopupMessage } from '@app/consts/popup-message.const';
import { PopupService } from '@app/services/popup/popup.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { UserService } from '@app/services/user/user.service';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-user-popup',
    templateUrl: './user-popup.component.html',
    styleUrls: ['./user-popup.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
})
export class UserPopupComponent {
    @Input() avatarImage: string = 'assets/images/menu/fullAvatars/fullAvatar0.png';
    userService: UserService = inject(UserService);
    currentUser: UserInfo | null = null;
    showBack = false;
    animationsEnabled = false;
    oldPassword: string = '';
    newPassword: string = '';
    confirmNewPassword: string = '';
    newUsername: string = '';
    passwordError: string = '';
    usernameError: string = '';
    isUpdatingPassword = false;
    isUpdatingUsername = false;
    private popupService: PopupService = inject(PopupService);
    private readonly preferencesService: PreferencesService = inject(PreferencesService);
    private readonly translateService: TranslateService = inject(TranslateService);

    constructor() {
        this.userService.user$.subscribe((user: UserInfo | null) => {
            this.currentUser = user;
            if (user) {
                this.newUsername = user.username;
            } else {
                this.resetForms();
            }
        });
    }

    get avatarToDisplay(): string {
        return this.currentUser?.fullProfilePicture || this.currentUser?.profilePicture || this.avatarImage;
    }

    toggleCard(): void {
        if (!this.currentUser) return;
        if (!this.animationsEnabled) {
            this.animationsEnabled = true;
        }
        this.showBack = !this.showBack;
        if (this.showBack) {
            this.usernameError = '';
            this.passwordError = '';
            this.newUsername = this.currentUser.username;
        } else {
            this.resetForms();
        }
    }

    updateUsername(): void {
        if (!this.currentUser) return;
        this.usernameError = '';
        const sanitizedUsername = (this.newUsername || '').toUpperCase().trim();
        if (!sanitizedUsername) {
            this.usernameError = this.translateService.instant('components.userPopup.usernameRequired');
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
                });
            },
            error: (err) => {
                this.passwordError = err?.error?.message || this.translateService.instant('components.userPopup.passwordChangeError');
                this.isUpdatingPassword = false;
            },
        });
    }

    logout(): void {
        this.popupService.showPopup({
            message: PopupMessage.LogoutConfirmation,
            hasCloseButton: true,
            isConfirmation: true,
            action: () => this.confirmLogout(),
        });
    }

    deleteAccount(): void {
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
                this.showBack = false;
                this.userService.setUser(null);
            },
        });
    }
}
