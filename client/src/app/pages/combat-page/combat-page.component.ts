import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { DEFAULT_COMBAT_ANIMATIONS } from '@app/consts/combat-data.const';
import { BATTLE_PLATFORM_IMAGES } from '@app/consts/images.const';
import { CombatAnimations } from '@app/interfaces/combat-animations';
import { CombatService } from '@app/services/combat/combat.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { DEFAULT_PLAYER_COMBAT_DATA } from '@common/consts/match-data.const';
import { PlayerCombatData } from '@common/interfaces/match-data';
import { DiceType } from '@common/interfaces/player-data';

@Component({
    selector: 'app-combat-page',
    templateUrl: './combat-page.component.html',
    styleUrls: ['./combat-page.component.scss'],
    imports: [CommonModule],
})
export class CombatPageComponent implements OnInit {
    avatarData = AVATAR_DATA;
    battlePlatformData = BATTLE_PLATFORM_IMAGES;
    diceType = DiceType;

    animation: CombatAnimations = structuredClone(DEFAULT_COMBAT_ANIMATIONS);
    selfPlayer: PlayerCombatData = structuredClone(DEFAULT_PLAYER_COMBAT_DATA);
    ennemyPlayer: PlayerCombatData = structuredClone(DEFAULT_PLAYER_COMBAT_DATA);

    iscurrentTurn = false;
    currentTime = 0;
    maxTime = 0;

    // private timerInterval: number | null = null;
    matchService: MatchService = inject(MatchService);
    private combatService: CombatService = inject(CombatService);
    private playService: PlayService = inject(PlayService);

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (!event.repeat) {
            if (event.key === 'd' || event.key === 'D') {
                this.playService.changeDebugMode();
            }
        }
    }

    ngOnInit(): void {
        this.animation = structuredClone(DEFAULT_COMBAT_ANIMATIONS);
    }

    escapeButon(): void {
        this.combatService.escape();
    }

    attackButton(): void {
        this.combatService.attack();
    }

    // private attackAnimation(attackResult: AttackResult): void {
    //     if (attackResult.targetId === this.selfPlayer.id) {
    //         this.animation.selfattack = false;
    //         this.animation.ennemyattack = true;
    //         if (attackResult.attackDamage > 0) {
    //             this.animation.selfDamage = true;
    //             this.animation.ennemyDamage = false;
    //         }
    //     } else if (attackResult.targetId === this.ennemyPlayer.id) {
    //         this.animation.selfattack = true;
    //         this.animation.ennemyattack = false;
    //         if (attackResult.attackDamage > 0) {
    //             this.animation.selfDamage = false;
    //             this.animation.ennemyDamage = true;
    //         }
    //     }

    //     const animationDelay = 1000;
    //     setTimeout(() => {
    //         this.animation.selfDamage = false;
    //         this.animation.ennemyDamage = false;
    //         this.animation.selfattack = false;
    //         this.animation.ennemyattack = false;
    //     }, animationDelay);

    //     return;
    // }

    // private deathAnimation(): void {
    //     if (this.selfPlayer.currentStats.health <= 0) {
    //         this.animation.selfDeath = true;
    //     } else if (this.ennemyPlayer.currentStats.health <= 0) {
    //         this.animation.ennemyDeath = true;
    //     }

    //     const animationTime = 2000;
    //     setTimeout(() => {
    //         this.animation.selfDeath = false;
    //         this.animation.ennemyDeath = false;
    //     }, animationTime);
    // }

    // private escapeAnimation(playerId: string): void {
    //     if (this.selfPlayer.id === playerId) {
    //         this.animation.selfEscape = true;
    //     } else if (this.ennemyPlayer.id === playerId) {
    //         this.animation.ennemyEscape = true;
    //     }

    //     const animationTime = 2000;
    //     setTimeout(() => {
    //         this.animation.selfEscape = false;
    //         this.animation.ennemyEscape = false;
    //     }, animationTime);
    // }

    // private setTimer(): void {
    //     if (this.timerInterval !== null) {
    //         clearInterval(this.timerInterval);
    //         this.timerInterval = null;
    //     }

    //     this.currentTime = this.maxTime;

    //     this.timerInterval = window.setInterval(() => {
    //         if (this.currentTime > 0) {
    //             this.currentTime--;
    //         } else {
    //             if (this.timerInterval !== null) {
    //                 clearInterval(this.timerInterval);
    //                 this.timerInterval = null;
    //             }
    //         }
    //     }, COMBAT_TIME_SCALE);
    // }
}
