import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { PopupMessage } from '@app/consts/popup-message.const';
import { UserInfo } from '@app/interfaces/user';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-user-popup',
    templateUrl: './user-popup.component.html',
    styleUrls: ['./user-popup.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class UserPopupComponent {
    @Input() avatarImage: string = './assets/images/menu/pokemons/chibi/pikachu.png';
    userService: UserService = inject(UserService);
    currentUser: UserInfo | null = null;
    private popupService: PopupService = inject(PopupService);

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

    private confirmLogout(): void {
        this.userService.logout().subscribe({
            next: () => this.userService.setUser(null),
        });
    }
}
