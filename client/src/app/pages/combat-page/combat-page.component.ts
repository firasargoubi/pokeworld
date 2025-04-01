import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { DEFAULT_COMBAT_VISUAL_DATA } from '@app/consts/combat-data.const';
import { BATTLE_PLATFORM_IMAGES } from '@app/consts/images.const';
import { CombatVisualData } from '@app/interfaces/combat-visual-data';
import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MatchState } from '@common/interfaces/match-data';
import { Avatar } from '@common/interfaces/player-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-combat-page',
    templateUrl: './combat-page.component.html',
    styleUrls: ['./combat-page.component.scss'],
    imports: [CommonModule],
})
export class CombatPageComponent {
    visualData: CombatVisualData = structuredClone(DEFAULT_COMBAT_VISUAL_DATA);
    matchService: MatchService = inject(MatchService);
    combatService: CombatService = inject(CombatService);
    private playService: PlayService = inject(PlayService);
    private router: Router = inject(Router);

    constructor() {
        if (!this.matchService.isInMatch()) {
            this.router.navigate([PageEndpoint.Menu]);
        }
        this.onMatchUpdate();
        this.updateImages();
        this.matchService.matchUpdate.pipe(takeUntilDestroyed()).subscribe(this.onMatchUpdate.bind(this));
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (!event.repeat) {
            if (event.key === 'd' || event.key === 'D') {
                this.playService.changeDebugMode();
            }
        }
    }

    attackButton() {
        this.combatService.attack();
    }

    escapeButon() {
        this.combatService.escape();
    }

    private updateImages() {
        this.visualData.selfPlatform = BATTLE_PLATFORM_IMAGES[this.visualData.selfPlayer.standingTile].selfPlatform;
        this.visualData.enemyPlatform = BATTLE_PLATFORM_IMAGES[this.visualData.enemyPlayer.standingTile].enemyPlatform;
        this.visualData.selfImage = AVATAR_DATA[this.matchService.data.players[this.visualData.selfPlayer.playerIndex].avatar].backGif;
        this.visualData.enemyImage = AVATAR_DATA[this.matchService.data.players[this.visualData.enemyPlayer.playerIndex].avatar].frontGif;
        this.visualData.isSelfPlayerEvolved = this.isAvatarEvolved(this.matchService.data.players[this.visualData.selfPlayer.playerIndex].avatar);
        this.visualData.isEnemyPlayerEvolved = this.isAvatarEvolved(this.matchService.data.players[this.visualData.enemyPlayer.playerIndex].avatar);
    }

    private onMatchUpdate() {
        this.checkForRedirect();
        this.updatePlayersCombatData();
    }

    private checkForRedirect() {
        const isMatchInCombatState = this.matchService.isState([MatchState.CombatWait, MatchState.CombatAnimation, MatchState.CombatEnd]);
        if (!isMatchInCombatState) {
            window.console.log('CombatPage.checkForRedirect()');
            this.router.navigate([PageEndpoint.Play]);
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
    }

    private isAvatarEvolved(avatar: Avatar): boolean {
        return avatar.toString().includes('-evolved');
    }
}
