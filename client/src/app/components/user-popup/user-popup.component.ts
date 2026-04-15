/* eslint-disable max-lines */
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopupMessage } from '@app/consts/popup-message.const';
import { DEBOUNCE_TIME_MS } from '@app/consts/social.const';
import { PopupColor } from '@app/interfaces/popup';
import { SoundEffect } from '@app/interfaces/sound-service';
import { UserCardType } from '@app/interfaces/user';
import { AudioService } from '@app/services/audio/audio.service';
import { PopupService } from '@app/services/popup/popup.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { SocialService } from '@app/services/social/social.service';
import { UserService } from '@app/services/user/user.service';
import { AVATAR_DATA } from '@common/consts/avatar-data.const';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@common/consts/player-data.const';
import { AVATAR_DESCRIPTIONS, MUSIC_DESCRIPTIONS, PARTY_BALL_DESCRIPTIONS, SHOP_ITEMS } from '@common/consts/shop.const';
import { Avatar } from '@common/interfaces/player-data';
import { MenuMusicVariant, PartyBallVariant } from '@common/interfaces/preferences';
import { InventoryItem, ShopItem, ShopItemType } from '@common/interfaces/shop';
import { RelationshipType, SocialListTab } from '@common/interfaces/social';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    selectedInventoryItem: ShopItem | null = null;
    userService: UserService = inject(UserService);
    currentUser: UserInfo | null = null;
    readonly shopItemType = ShopItemType;
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
    private readonly inventoryNameKeys = new Map(SHOP_ITEMS.map((item) => [item.id, item.nameKey]));
    private readonly defaultInventoryItems: ShopItem[] = [
        { id: 'party-ball-0', nameKey: 'components.shopPopup.items.partyBall0', price: 0, type: ShopItemType.Button, variant: PartyBallVariant.Zero },
        { id: 'menu-music-0', nameKey: 'components.shopPopup.items.menuMusic0', price: 0, type: ShopItemType.Music, variant: MenuMusicVariant.Zero },
    ];
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
            this.syncSelectedInventoryItem();
        });

        const userId = this.userService.currentUser?.userId;
        if (userId) {
            this.userService.getById(userId).subscribe({
                next: (user) => this.userService.setUser(user),
            });
        }

        this.searchSub = this.searchSubject.pipe(debounceTime(this.searchDebounceMs), distinctUntilChanged()).subscribe((value) => {
            this.socialService.setSearchQuery(value);
        });
    }

    get avatarToDisplay(): string {
        return this.currentUser?.fullProfilePicture || this.currentUser?.profilePicture || this.avatarImage;
    }

    get inventoryItems(): InventoryItem[] {
        return this.currentUser?.inventory ?? [];
    }

    get ownedButtonItems(): ShopItem[] {
        return this.defaultInventoryItems
            .filter((item) => item.type === ShopItemType.Button)
            .concat(SHOP_ITEMS.filter((item) => item.type === ShopItemType.Button && this.hasInventoryItem(item.id)));
    }

    get ownedMusicItems(): ShopItem[] {
        return this.defaultInventoryItems
            .filter((item) => item.type === ShopItemType.Music)
            .concat(SHOP_ITEMS.filter((item) => item.type === ShopItemType.Music && this.hasInventoryItem(item.id)));
    }

    get ownedPokemonItems(): ShopItem[] {
        return SHOP_ITEMS.filter((item) => item.type === ShopItemType.Pokemon && this.hasInventoryItem(item.id));
    }

    get numberOfChallenges(): number {
        let total = 0;
        this.currentUser?.challenges.forEach((challenge) => {
            total += challenge.completed;
        });
        return total;
    }

    selectInventoryItem(item: ShopItem): void {
        this.audioService.playEffect(SoundEffect.Click);
        this.selectedInventoryItem = item;
        if (item.type === ShopItemType.Music) {
            const variant = item.variant as MenuMusicVariant;
            this.audioService.playBackgroundMusic(this.preferencesService.getHomeMenuTrack(variant));
        } else {
            this.audioService.playBackgroundMusic(this.preferencesService.getHomeMenuTrack());
        }
    }

    getInventoryItemPreview(item: ShopItem): string {
        if (item.type === ShopItemType.Button) {
            return this.preferencesService.getPartyBallAssetForVariant(item.variant as PartyBallVariant, false);
        }
        if (item.type === ShopItemType.Pokemon) {
            return AVATAR_DATA[item.variant as Avatar]?.imageCentered ?? '';
        }
        if (item.type === ShopItemType.Music) {
            return `/assets/images/menu/shop-items/tm-${item.variant}.png`;
        }
        return '';
    }

    getMusicTrackNumber(item: ShopItem): string {
        return (item.variant as MenuMusicVariant) ?? '?';
    }

    getItemDescription(item: ShopItem): string {
        switch (item.type) {
            case ShopItemType.Button:
                return PARTY_BALL_DESCRIPTIONS[item.variant as PartyBallVariant] ?? '';
            case ShopItemType.Music:
                return MUSIC_DESCRIPTIONS[item.variant as MenuMusicVariant] ?? '';
            case ShopItemType.Pokemon:
                return AVATAR_DESCRIPTIONS[item.variant as Avatar] ?? '';
            default:
                return '';
        }
    }

    isInventoryItemEquipped(item: ShopItem): boolean {
        if (item.type === ShopItemType.Button) {
            return this.preferencesService.currentPartyBall === (item.variant as PartyBallVariant);
        }
        if (item.type === ShopItemType.Music) {
            return this.preferencesService.currentMenuMusic === (item.variant as MenuMusicVariant);
        }
        return false;
    }

    equipInventoryItem(item: ShopItem | null): void {
        if (!item || !this.currentUser) return;
        this.audioService.playEffect(SoundEffect.Click);

        if (item.type === ShopItemType.Button) {
            const variant = item.variant as PartyBallVariant;
            if (variant) this.preferencesService.setPartyBall(variant);
            return;
        }

        if (item.type === ShopItemType.Music) {
            const variant = item.variant as MenuMusicVariant;
            if (variant) {
                this.preferencesService.setMenuMusic(variant);
                this.audioService.playBackgroundMusic(this.preferencesService.getHomeMenuTrack());
            }
        }
    }

    onSearchInput(value: string): void {
        this.searchSubject.next(value ?? '');
    }

    ngOnDestroy(): void {
        this.audioService.playBackgroundMusic(this.preferencesService.getHomeMenuTrack());
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
        if (card === UserCardType.Inventory) {
            this.syncSelectedInventoryItem();
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
        this.audioService.playBackgroundMusic(this.preferencesService.getHomeMenuTrack());
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

    getInventoryItemNameKey(itemId: string): string {
        return this.inventoryNameKeys.get(itemId) ?? 'components.shopPopup.unknownItem';
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

    private hasInventoryItem(itemId: string): boolean {
        return this.inventoryItems.some((item) => item.itemId === itemId);
    }

    private syncSelectedInventoryItem(): void {
        const ownedItems = this.getOwnedInventoryShopItems();
        if (ownedItems.length === 0) {
            this.selectedInventoryItem = null;
            return;
        }

        if (this.selectedInventoryItem && ownedItems.some((item) => item.id === this.selectedInventoryItem?.id)) {
            return;
        }

        this.selectedInventoryItem = ownedItems[0];
    }

    private getOwnedInventoryShopItems(): ShopItem[] {
        return this.defaultInventoryItems.concat(SHOP_ITEMS.filter((item) => this.hasInventoryItem(item.id)));
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
