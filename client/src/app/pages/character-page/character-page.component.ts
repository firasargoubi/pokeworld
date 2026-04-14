import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { ELEMENTAL_TYPE_LABEL_CONFIG } from '@app/consts/elemental-type.const';
import { DEFAULT_CHARACTER_VISUAL_DATA } from '@app/consts/player-data.const';
import { PopupMessage } from '@app/consts/popup-message.const';
import { CharacterVisualData } from '@app/interfaces/character-visual-data';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatService } from '@app/services/chat/chat.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { MatchService } from '@app/services/match/match.service';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';
import { AVATAR_DATA, MAX_SELECTABLE_AVATAR_INDEX, MIN_SELECTABLE_AVATAR_INDEX } from '@common/consts/avatar-data.const';
import { AVATAR_ELEMENT_TYPE_MAP } from '@common/consts/elemental-type';
import { BONUS_STAT, DEFAULT_STAT } from '@common/consts/player-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { Avatar, DiceType, PlayerData } from '@common/interfaces/player-data';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-character-page',
    imports: [ReactiveFormsModule, HeaderComponent, CommonModule, FormsModule, ChatComponent, TranslateModule],
    templateUrl: './character-page.component.html',
    styleUrl: './character-page.component.scss',
})
export class CharacterPageComponent {
    user: UserInfo | null = null;
    visualData: CharacterVisualData = structuredClone(DEFAULT_CHARACTER_VISUAL_DATA);
    elementalTypeLabelConfig = structuredClone(ELEMENTAL_TYPE_LABEL_CONFIG);
    avatarToElementalTypeMap = structuredClone(AVATAR_ELEMENT_TYPE_MAP);
    readonly audioService: AudioService = inject(AudioService);
    readonly clickValue = SoundEffect.Click;
    private matchService: MatchService = inject(MatchService);
    private popupService: PopupService = inject(PopupService);
    private lobbyService: LobbyService = inject(LobbyService);
    private userService: UserService = inject(UserService);
    private i18nService: I18nService = inject(I18nService);
    private readonly chatService: ChatService = inject(ChatService);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private router: Router = inject(Router);

    constructor() {
        this.userService.user$.subscribe((user: UserInfo | null) => {
            this.user = user;
        });

        const currentUser = this.userService.currentUser;
        if (currentUser) {
            this.refreshCurrentUser(currentUser.userId);
        }

        if (this.matchService.isInMatch()) {
            this.updateAvatarList();
            this.matchService.matchUpdate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.updateAvatarList.bind(this));
        } else {
            this.router.navigate([PageEndpoint.Menu]);
        }
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        const chatIsNotVisible = !this.chatService.isComponentVisible();
        if (event.key === 'Enter' && chatIsNotVisible) {
            this.joinLobby();
        }
    }

    goToMenu() {
        this.audioService.playEffect(SoundEffect.Click);
        this.popupService.showPopup({
            message: PopupMessage.Quit,
            hasCloseButton: true,
            isConfirmation: true,
            action: this.matchService.leaveMatch.bind(this.matchService),
        });
    }

    toggleBonusDice() {
        this.audioService.playEffect(SoundEffect.Click);
        this.visualData.isAttackSelected = !this.visualData.isAttackSelected;
    }

    joinLobby() {
        this.audioService.playEffect(SoundEffect.Click);
        const warnings = this.getWarnings();
        if (warnings.length > 0) {
            this.popupService.showPopup({
                message: warnings.join('\n'),
                hasCloseButton: false,
                isConfirmation: false,
            });
        } else {
            const playerData = this.getPlayerData();
            this.lobbyService.joinLobby(playerData);
        }
    }

    changeAvatar(avatar: Avatar) {
        this.audioService.playEffect(SoundEffect.Click);
        const lockedAvatars = this.matchService.getLockedAvatars();
        if (!lockedAvatars.includes(avatar)) {
            this.lobbyService.changeAvatar(avatar);
        }
    }

    private updateAvatarList() {
        const selfAvatar = this.matchService.selfPlayer.avatar;
        const lockedAvatars = this.matchService.getLockedAvatars();

        this.visualData.selfAvatarimage = AVATAR_DATA[selfAvatar].image;
        this.visualData.isAvatarSelected = selfAvatar !== Avatar.Default;
        this.visualData.avatarList = Object.values(Avatar)
            .slice(MIN_SELECTABLE_AVATAR_INDEX, MAX_SELECTABLE_AVATAR_INDEX)
            .filter((avatar) => this.isAvatarVisible(avatar))
            .map((avatar) => ({
                avatar,
                name: AVATAR_DATA[avatar].name,
                image: AVATAR_DATA[avatar].imageCentered,
                isLocked: lockedAvatars.includes(avatar),
                isSelected: selfAvatar === avatar,
            }));
    }

    private isAvatarVisible(avatar: Avatar): boolean {
        const premiumAvatarIds: Avatar[] = [Avatar.Avatar13, Avatar.Avatar14, Avatar.Avatar15];
        if (premiumAvatarIds.includes(avatar)) {
            return (this.user?.inventory ?? []).some((item) => item.itemId === avatar);
        }
        return true;
    }

    private getPlayerData(): PlayerData {
        const playerData = this.matchService.selfPlayer;
        playerData.name = this.user?.username.toUpperCase().trim() || 'Joueur';
        playerData.health = this.visualData.isHpSelected ? BONUS_STAT : DEFAULT_STAT;
        playerData.speed = this.visualData.isHpSelected ? DEFAULT_STAT : BONUS_STAT;
        playerData.attackDice = this.visualData.isAttackSelected ? DiceType.D6 : DiceType.D4;
        playerData.defenseDice = this.visualData.isAttackSelected ? DiceType.D4 : DiceType.D6;
        playerData.profilePicture = this.user?.profilePicture || '';
        playerData.fullProfilePicture = this.user?.fullProfilePicture || '';
        playerData.userId = this.user?.userId || '';
        return playerData;
    }

    private getWarnings() {
        const warningList: string[] = [];
        if (this.matchService.selfPlayer.avatar === Avatar.Default) {
            warningList.push(`- ${this.i18nService.translate('pages.character.chooseAvatarWarning')}`);
        }
        return warningList;
    }

    private refreshCurrentUser(userId: string): void {
        this.userService
            .getUserById(userId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((user) => {
                this.user = user;
                this.userService.setUser(user);
                this.updateAvatarList();
            });
    }
}
