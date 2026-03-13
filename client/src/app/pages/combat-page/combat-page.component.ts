import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { DEFAULT_COMBAT_VISUAL_DATA } from '@app/consts/combat-data.const';
import { BATTLE_PLATFORM_IMAGES } from '@app/consts/images.const';
import { CombatVisualData } from '@app/interfaces/combat-visual-data';
import { PopupColor } from '@app/interfaces/popup';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { COMBAT_PAGE_EFFECTS } from '@app/services/audio/audio.const';
import { AudioService } from '@app/services/audio/audio.service';
import { CombatService } from '@app/services/combat/combat.service';
import { I18nService } from '@app/services/i18n/i18n.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { PopupService } from '@app/services/popup/popup.service';
import { UserService } from '@app/services/user/user.service';
import { AVATAR_DATA } from '@common/consts/avatar-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { ItemType } from '@common/interfaces/item-type.enum';
import { CombatAction, MatchData, MatchState, PlayerCombatData, SpectatorPanelData } from '@common/interfaces/match-data';
import { PlayerType } from '@common/interfaces/player-data';
import { UserInfo } from '@common/interfaces/user';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-combat-page',
    templateUrl: './combat-page.component.html',
    styleUrls: ['./combat-page.component.scss'],
    imports: [CommonModule, ChatComponent, TranslateModule],
})
export class CombatPageComponent implements OnDestroy {
    visualData: CombatVisualData = structuredClone(DEFAULT_COMBAT_VISUAL_DATA);
    matchService: MatchService = inject(MatchService);
    combatService: CombatService = inject(CombatService);
    isInCombat: boolean = false;
    currentUser: UserInfo | null = null;
    spectatorPanels: SpectatorPanelData[] = [];

    readonly audioService: AudioService = inject(AudioService);
    readonly clickValue = SoundEffect.Click;

    private readonly botAggressiveImage = './assets/images/menu/icons/bot-aggressive.png';
    private readonly botDefensiveImage = './assets/images/menu/icons/bot-defensive.png';
    private playService: PlayService = inject(PlayService);
    private userService: UserService = inject(UserService);
    private router: Router = inject(Router);
    private popupService: PopupService = inject(PopupService);
    private i18nService: I18nService = inject(I18nService);

    constructor() {
        if (this.matchService.isInMatch()) {
            this.userService.user$.subscribe((user: UserInfo | null) => (this.currentUser = user));
            this.onMatchUpdate(this.matchService.data);
            this.updateImages();
            this.computeItems();
            this.matchService.matchUpdate.pipe(takeUntilDestroyed()).subscribe(this.onMatchUpdate.bind(this));
        } else {
            this.router.navigate([PageEndpoint.Menu]);
        }
        this.audioService.preloadEffectsForPage(COMBAT_PAGE_EFFECTS);
        this.audioService.playBackgroundMusic(BackgroundMusic.Combat);
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        const activeElement = document.activeElement as HTMLElement;
        const isChatFocussed = activeElement.tagName === 'INPUT';
        const isDKeyPressed = event.key === 'd' || event.key === 'D';
        if (!isChatFocussed && !event.repeat && isDKeyPressed) {
            this.playService.changeDebugMode();
        }
    }

    ngOnDestroy() {
        this.audioService.playBackgroundMusic(BackgroundMusic.Home);
    }

    attackButton() {
        this.audioService.playEffect(SoundEffect.Click);
        this.combatService.attack();
    }

    escapeButon() {
        this.audioService.playEffect(SoundEffect.Click);
        this.combatService.escape();
    }

    private updateImages() {
        this.visualData.selfPlatform = BATTLE_PLATFORM_IMAGES[this.visualData.selfPlayer.standingTile].selfPlatform;
        this.visualData.enemyPlatform = BATTLE_PLATFORM_IMAGES[this.visualData.enemyPlayer.standingTile].enemyPlatform;
        this.visualData.selfImage = AVATAR_DATA[this.matchService.data.players[this.visualData.selfPlayer.playerIndex].avatar].backGif;
        this.visualData.enemyImage = AVATAR_DATA[this.matchService.data.players[this.visualData.enemyPlayer.playerIndex].avatar].frontGif;
        this.visualData.selfProfilePicture = this.matchService.data.players[this.visualData.selfPlayer.playerIndex].profilePicture;
        this.visualData.enemyProfilePicture = this.matchService.data.players[this.visualData.enemyPlayer.playerIndex].profilePicture;
    }

    private onMatchUpdate(oldMatchData: MatchData) {
        this.checkForRedirect();
        this.updatePlayersCombatData();
        this.checkHealingAnimation(oldMatchData);
        this.audioService.playCombatEffect(oldMatchData);
    }

    private checkForRedirect() {
        const isNotIncombat = this.matchService.isState([MatchState.TurnWait, MatchState.TurnStart, MatchState.MatchEnd]);
        if (isNotIncombat) {
            this.displayPopupMessage();
            this.router.navigate([PageEndpoint.Play]);
        }
    }

    private displayPopupMessage() {
        let winnerName = '';
        if (this.visualData.selfPlayer.currentHealth <= 0) {
            winnerName = this.matchService.data.players[this.visualData.enemyPlayer.playerIndex].name;
        } else if (this.visualData.enemyPlayer.currentHealth <= 0) {
            winnerName = this.matchService.data.players[this.visualData.selfPlayer.playerIndex].name;
        }

        if (winnerName) {
            this.popupService.keepMessages();
            this.popupService.showPopup({
                message: `${winnerName} ${this.i18nService.translate('pages.combat.winnerSuffix')}`,
                hasCloseButton: false,
                isConfirmation: false,
                popupColor: PopupColor.Blue,
            });
        } else {
            this.popupService.keepMessages();
            this.popupService.showPopup({
                message: 'popup.noWinner',
                hasCloseButton: false,
                isConfirmation: false,
                popupColor: PopupColor.Blue,
            });
        }
    }

    private updatePlayersCombatData() {
        const isFirstPlayer = this.matchService.data.combatData.playersCombatData[0].playerIndex === this.matchService.selfIndex;
        if (isFirstPlayer) {
            this.visualData.selfPlayer = this.matchService.data.combatData.playersCombatData[0];
            this.visualData.enemyPlayer = this.matchService.data.combatData.playersCombatData[1];
            this.visualData.isSelfTurn = !this.matchService.data.combatData.isSecondPlayerTurn;
        } else {
            this.visualData.selfPlayer = this.matchService.data.combatData.playersCombatData[1];
            this.visualData.enemyPlayer = this.matchService.data.combatData.playersCombatData[0];
            this.visualData.isSelfTurn = this.matchService.data.combatData.isSecondPlayerTurn;
        }
        if (this.matchService.data.combatData.playersCombatData.find((p) => p.name === this.currentUser?.username)) {
            this.isInCombat = true;
        }
        this.updateSpectatorPanels();
    }

    private checkHealingAnimation(oldMatchData: MatchData) {
        const isSelfHealing = this.hasPlayerHealed(oldMatchData, this.visualData.selfPlayer);
        const isEnemyHealing = this.hasPlayerHealed(oldMatchData, this.visualData.enemyPlayer);

        const isSelfHealingNew = !this.visualData.isSelfHealing && isSelfHealing;
        const isEnemyHealingNew = !this.visualData.isEnemyHealing && isEnemyHealing;
        if (isSelfHealingNew || isEnemyHealingNew) {
            this.audioService.playEffect(SoundEffect.Heal);
        }

        this.visualData.isSelfHealing = isSelfHealing;
        this.visualData.isEnemyHealing = isEnemyHealing;
    }

    private hasPlayerHealed(oldMatchData: MatchData, playerData: PlayerCombatData): boolean {
        const previousData = oldMatchData.combatData.playersCombatData.find(
            (data) => data.playerIndex === playerData.playerIndex,
        ) as PlayerCombatData;
        const hasHealed = playerData.currentHealth > previousData.currentHealth;
        const hasCombatStarted = this.matchService.data.combatData.lastCombatAction !== CombatAction.None;
        const isCombatWait = this.matchService.data.state === MatchState.CombatWait;

        return hasHealed && hasCombatStarted && isCombatWait;
    }

    private computeItems() {
        if (this.matchService.data.players[this.visualData.selfPlayer.playerIndex].items.includes(ItemType.Item6)) {
            this.visualData.selfImage = AVATAR_DATA.missingNo.backGif;
        }
        if (this.matchService.data.players[this.visualData.enemyPlayer.playerIndex].items.includes(ItemType.Item6)) {
            this.visualData.enemyImage = AVATAR_DATA.missingNo.backGif;
        }
    }

    private updateSpectatorPanels() {
        const combatants = this.matchService.data.combatData.playersCombatData ?? [];
        if (!combatants.length) {
            this.spectatorPanels = [];
            return;
        }

        const allPanels = combatants
            .map((combatant) => {
                const player = this.matchService.data.players[combatant.playerIndex];
                if (!player) {
                    return null;
                }

                let profilePicture = combatant.fullProfilePicture ?? AVATAR_DATA[player.avatar].imageCentered;
                if (player.type === PlayerType.BotAggressive) {
                    profilePicture = this.botAggressiveImage;
                } else if (player.type === PlayerType.BotDefensive) {
                    profilePicture = this.botDefensiveImage;
                }

                return {
                    playerIndex: combatant.playerIndex,
                    name: player.name,
                    profilePicture,
                    playerType: player.type,
                    attack: combatant.attack,
                    attackDice: player.attackDice,
                    defense: combatant.defense,
                    defenseDice: player.defenseDice,
                    speed: player.speed,
                    currentHealth: combatant.currentHealth,
                    maxHealth: player.health,
                };
            })
            .filter((panel): panel is SpectatorPanelData => panel !== null);

        const selfPanel = allPanels.find((p) => p.playerIndex === this.visualData.selfPlayer.playerIndex);
        const enemyPanel = allPanels.find((p) => p.playerIndex === this.visualData.enemyPlayer.playerIndex);
        this.spectatorPanels = [selfPanel, enemyPanel].filter((p): p is SpectatorPanelData => p != null);
    }
}
