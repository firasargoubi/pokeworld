import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { BATTLE_PLATFORM_IMAGES } from '@app/consts/images.const';
import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { DEFAULT_PLAYER_COMBAT_DATA } from '@common/consts/combat-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { CombatAction, MatchState, PlayerCombatData } from '@common/interfaces/match-data';
import { DiceType } from '@common/interfaces/player-data';

@Component({
    selector: 'app-combat-page',
    templateUrl: './combat-page.component.html',
    styleUrls: ['./combat-page.component.scss'],
    imports: [CommonModule],
})
export class CombatPageComponent {
    avatarData = AVATAR_DATA;
    battlePlatformData = BATTLE_PLATFORM_IMAGES;
    combatAction = CombatAction;
    matchState = MatchState;
    diceType = DiceType;
    isSelfTurn = false;
    selfPlayer: PlayerCombatData = structuredClone(DEFAULT_PLAYER_COMBAT_DATA);
    enemyPlayer: PlayerCombatData = structuredClone(DEFAULT_PLAYER_COMBAT_DATA);
    matchService: MatchService = inject(MatchService);
    private combatService: CombatService = inject(CombatService);
    private playService: PlayService = inject(PlayService);
    private router: Router = inject(Router);

    constructor() {
        if (!this.matchService.isInMatch()) {
            this.router.navigate([PageEndpoint.Menu]);
        }
        this.onMatchUpdate();
        this.matchService.matchUpdate.subscribe(this.onMatchUpdate.bind(this));
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

    private onMatchUpdate() {
        this.checkForRedirect();
        this.updatePlayersCombatData();
    }

    private checkForRedirect() {
        const isMatchInCombatState = this.matchService.isState([MatchState.CombatWait, MatchState.CombatAnimation, MatchState.CombatEnd]);
        if (!isMatchInCombatState) {
            this.router.navigate([PageEndpoint.Play]);
        }
    }

    private updatePlayersCombatData() {
        const isFirstPlayer = this.matchService.data.combatData.playersCombatData[0].playerIndex === this.matchService.selfIndex;
        if (isFirstPlayer) {
            this.selfPlayer = this.matchService.data.combatData.playersCombatData[0];
            this.enemyPlayer = this.matchService.data.combatData.playersCombatData[1];
            this.isSelfTurn = !this.matchService.data.combatData.isSecondPlayerTurn;
        } else {
            this.selfPlayer = this.matchService.data.combatData.playersCombatData[1];
            this.enemyPlayer = this.matchService.data.combatData.playersCombatData[0];
            this.isSelfTurn = this.matchService.data.combatData.isSecondPlayerTurn;
        }
    }
}
