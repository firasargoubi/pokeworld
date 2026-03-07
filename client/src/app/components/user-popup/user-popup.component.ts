import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopupMessage } from '@app/consts/popup-message.const';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-user-popup',
    templateUrl: './user-popup.component.html',
    styleUrls: ['./user-popup.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
})
export class UserPopupComponent {
    @Input() avatarImage: string = './assets/images/menu/pokemons/chibi/pikachu.png';
    userService: UserService = inject(UserService);
    currentUser: UserInfo | null = null;
    editMode: boolean = false;
    oldPassword: string = '';
    newPassword: string = '';
    passwordError: string = '';
    private popupService: PopupService = inject(PopupService);
    private readonly preferencesService: PreferencesService = inject(PreferencesService);

    constructor() {
        this.userService.user$.subscribe((user: UserInfo | null) => (this.currentUser = user));
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

    toggleEditPassword(): void {
        this.editMode = !this.editMode;
        this.oldPassword = '';
        this.newPassword = '';
    }

    editPassword(): void {
        this.passwordError = '';
        if (!this.currentUser || !this.oldPassword.trim() || !this.newPassword.trim()) {
            this.passwordError = 'components.userPopup.passwordFieldsRequired';
            return;
        }
        this.userService.edit(this.currentUser.userId, this.oldPassword.trim(), this.newPassword.trim()).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.editMode = false;
                this.oldPassword = '';
                this.newPassword = '';
                this.popupService.showPopup({
                    message: PopupMessage.ChangeConfirmed,
                    hasCloseButton: true,
                    isConfirmation: false,
                });
            },
            error: (err) => {
                this.passwordError = err?.error?.message || 'components.userPopup.passwordChangeError';
            },
        });
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
            next: () => this.userService.setUser(null),
        });
    }
}
