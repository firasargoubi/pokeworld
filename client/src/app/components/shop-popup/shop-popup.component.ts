import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BalanceService } from '@app/services/balance/balance.service';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';
import { SHOP_ITEMS } from '@common/consts/shop.const';
import { ShopItem } from '@common/interfaces/shop';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-shop-popup',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './shop-popup.component.html',
    styleUrls: ['./shop-popup.component.scss'],
})
export class ShopPopupComponent {
    currentUser: UserInfo | null = null;
    shopItems: ShopItem[] = structuredClone(SHOP_ITEMS);
    isLoading = false;
    private readonly balanceService = inject(BalanceService);
    private readonly popupService = inject(PopupService);
    private readonly translateService = inject(TranslateService);
    private readonly userService = inject(UserService);

    constructor() {
        this.userService.user$.subscribe((user) => {
            this.currentUser = user;
        });

        this.balanceService.getShopItems().subscribe({
            next: (items) => {
                this.shopItems = items;
            },
        });
    }

    isOwned(itemId: string): boolean {
        return (this.currentUser?.inventory || []).some((inventoryItem) => inventoryItem.itemId === itemId);
    }

    purchaseItem(item: ShopItem): void {
        if (!this.currentUser || this.isLoading) {
            return;
        }

        if (this.isOwned(item.id)) {
            return;
        }

        if (this.currentUser.balance < item.price) {
            this.popupService.showPopup({
                message: 'components.shopPopup.insufficientFunds',
                hasCloseButton: true,
                isConfirmation: false,
            });
            return;
        }

        this.isLoading = true;
        this.balanceService.purchaseItem(this.currentUser.userId, item.id).subscribe({
            next: (user) => {
                this.userService.setUser(user);
                this.isLoading = false;
                this.popupService.showPopup({
                    message: this.translateService.instant('components.shopPopup.purchaseSuccess', {
                        itemName: this.translateService.instant(item.nameKey),
                    }),
                    hasCloseButton: true,
                    isConfirmation: false,
                });
            },
            error: (err) => {
                this.isLoading = false;
                this.popupService.showPopup({
                    message: err.error.message,
                    hasCloseButton: true,
                    isConfirmation: false,
                });
            },
        });
    }
}
