import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BalanceService } from '@app/services/balance/balance.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { UserService } from '@app/services/user/user.service';
import { AVATAR_DATA } from '@common/consts/avatar-data.const';
import { SHOP_ITEMS } from '@common/consts/shop.const';
import { Avatar } from '@common/interfaces/player-data';
import { MenuMusicVariant, PartyBallVariant } from '@common/interfaces/preferences';
import { ShopItem, ShopItemType } from '@common/interfaces/shop';
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
    selectedItem: ShopItem | null = null;
    isLoading = false;
    private readonly balanceService = inject(BalanceService);
    private readonly popupService = inject(PopupService);
    private readonly preferencesService = inject(PreferencesService);
    private readonly translateService = inject(TranslateService);
    private readonly userService = inject(UserService);

    constructor() {
        this.userService.user$.subscribe((user) => {
            this.currentUser = user;
        });

        this.balanceService.getShopItems().subscribe({
            next: (items) => {
                this.shopItems = items;
                if (!this.selectedItem && items.length > 0) {
                    this.selectedItem = items[0];
                }
            },
        });

        const userId = this.userService.currentUser?.userId;
        if (userId) {
            this.userService.getById(userId).subscribe({
                next: (user) => this.userService.setUser(user),
            });
        }

        if (this.shopItems.length > 0) {
            this.selectedItem = this.shopItems[0];
        }
    }

    get buttonItems(): ShopItem[] {
        return this.shopItems.filter((item) => item.type === ShopItemType.Button);
    }

    get musicItems(): ShopItem[] {
        return this.shopItems.filter((item) => item.type === ShopItemType.Music);
    }

    get pokemonItems(): ShopItem[] {
        return this.shopItems.filter((item) => item.type === ShopItemType.Pokemon);
    }
    isOwned(itemId: string): boolean {
        return (this.currentUser?.inventory || []).some((inventoryItem) => inventoryItem.itemId === itemId);
    }

    selectItem(item: ShopItem): void {
        this.selectedItem = item;
    }

    getItemPreview(item: ShopItem): string {
        if (item.type === ShopItemType.Button) {
            return this.preferencesService.getPartyBallAssetForVariant(item.variant as PartyBallVariant, false);
        }
        if (item.type === ShopItemType.Pokemon) {
            return this.getPokemonPreview(item);
        }
        return '';
    }

    getPokemonPreview(item: ShopItem): string {
        const avatar = item.variant as Avatar;
        return avatar ? AVATAR_DATA[avatar]?.imageCentered ?? '' : '';
    }

    isPokemonItem(item: ShopItem | null): boolean {
        return item?.type === ShopItemType.Pokemon;
    }

    getItemTypeLabel(type: ShopItemType): string {
        return type === ShopItemType.Button ? 'components.shopPopup.typeButton' : 'components.shopPopup.typeMusic';
    }

    purchaseItem(item: ShopItem | null): void {
        if (!item || !this.currentUser || this.isLoading) {
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
    getMusicTrackNumber(item: ShopItem): string {
        return (item.variant as MenuMusicVariant) ?? '?';
    }

    isMusicItem(item: ShopItem | null): boolean {
        return item?.type === ShopItemType.Music;
    }

    isButtonItem(item: ShopItem | null): boolean {
        return item?.type === ShopItemType.Button;
    }
}
