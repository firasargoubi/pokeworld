import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { BATTLE_PLATFORM_DATA } from '@app/consts/battle-platforms.const';
import { DEFAULT_COMBAT_ANIMATIONS } from '@app/consts/combat-animations.const';
import { CombatAnimations } from '@app/interfaces/combat-animations';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CombatSocketService } from '@app/services/sockets/combat-socket/combat-socket.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { AttackResult } from '@common/combat';
import { Player } from '@common/player';
import { COMBAT_TIME_SCALE } from './combat-page.component.const';

@Component({
    selector: 'app-combat-page',
    templateUrl: './combat-page.component.html',
    styleUrls: ['./combat-page.component.scss'],
    imports: [CommonModule],
})
export class CombatPageComponent implements OnInit {
    avatarsData = AVATAR_DATA;
    battlePlatformData = BATTLE_PLATFORM_DATA;

    animation: CombatAnimations = structuredClone(DEFAULT_COMBAT_ANIMATIONS);
    selfPlayer: Player;
    ennemyPlayer: Player;

    iscurrentTurn = false;
    currentTime = 0;
    maxTime = 0;

    private combatSocketService: CombatSocketService = inject(CombatSocketService);
    private timerInterval: number | null = null;
    private router = inject(Router);
    private popupService: PopupService = inject(PopupService);
    private matchDataService: MatchDataService = inject(MatchDataService);
    private coreSocketService: CoreSocketService = inject(CoreSocketService);

    constructor() {
        if (this.combatSocketService) {
            this.combatSocketService.selfPlayer$.subscribe((player) => {
                if (player) this.selfPlayer = player;
            });
            this.combatSocketService.ennemyPlayer$.subscribe((player) => {
                if (player) this.ennemyPlayer = player;
            });
            this.combatSocketService.currentTurn.subscribe((turn) => {
                this.iscurrentTurn = turn;
            });
            this.combatSocketService.currentTimer.subscribe((timer) => {
                this.maxTime = timer / COMBAT_TIME_SCALE;
                this.setTimer();
            });
            this.combatSocketService.attackResult.subscribe((attackResult) => {
                if (attackResult) {
                    this.attackAnimation(attackResult);
                }
            });
            this.combatSocketService.escapeResult.subscribe((playerId) => {
                if (playerId) {
                    this.iscurrentTurn = false;
                    this.escapeAnimation(playerId);
                }
            });

            this.combatSocketService.combatResult.subscribe((combatResult) => {
                if (combatResult) {
                    this.iscurrentTurn = false;
                    this.deathAnimation();
                }
            });
            this.coreSocketService.connectionStatus.subscribe((status) => this.verifySocketConnection(status));
        }
    }

    ngOnInit(): void {
        this.animation = structuredClone(DEFAULT_COMBAT_ANIMATIONS);
    }

    escapeAttempt(): void {
        this.combatSocketService.escapeAttempt();
    }

    attackAttempt(): void {
        this.combatSocketService.attackAttempt();
    }

    private attackAnimation(attackResult: AttackResult): void {
        if (attackResult.targetId === this.selfPlayer.id) {
            this.animation.selfattack = false;
            this.animation.ennemyattack = true;
            if (attackResult.attackDamage > 0) {
                this.animation.selfDamage = true;
                this.animation.ennemyDamage = false;
            }
        } else if (attackResult.targetId === this.ennemyPlayer.id) {
            this.animation.selfattack = true;
            this.animation.ennemyattack = false;
            if (attackResult.attackDamage > 0) {
                this.animation.selfDamage = false;
                this.animation.ennemyDamage = true;
            }
        }

        const animationDelay = 1000;
        setTimeout(() => {
            this.animation.selfDamage = false;
            this.animation.ennemyDamage = false;
            this.animation.selfattack = false;
            this.animation.ennemyattack = false;
        }, animationDelay);

        return;
    }

    private deathAnimation(): void {
        if (this.selfPlayer.currentStats.health <= 0) {
            this.animation.selfDeath = true;
        } else if (this.ennemyPlayer.currentStats.health <= 0) {
            this.animation.ennemyDeath = true;
        }

        const animationTime = 2000;
        setTimeout(() => {
            this.animation.selfDeath = false;
            this.animation.ennemyDeath = false;
        }, animationTime);
    }

    private escapeAnimation(playerId: string): void {
        if (this.selfPlayer.id === playerId) {
            this.animation.selfEscape = true;
        } else if (this.ennemyPlayer.id === playerId) {
            this.animation.ennemyEscape = true;
        }

        const animationTime = 2000;
        setTimeout(() => {
            this.animation.selfEscape = false;
            this.animation.ennemyEscape = false;
        }, animationTime);
    }

    private setTimer(): void {
        if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.currentTime = this.maxTime;

        this.timerInterval = window.setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
            } else {
                if (this.timerInterval !== null) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
            }
        }, COMBAT_TIME_SCALE);
    }

    private verifySocketConnection(isConnected: boolean) {
        if (!isConnected || this.matchDataService.matchData.players.length <= 0) {
            this.popupService.clearMessages();
            this.popupService.showPopup('Erreur de connection avec le serveur');
            this.popupService.keepMessages();

            this.router.navigate(['/']);
        }
    }
}
