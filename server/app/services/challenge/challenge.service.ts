import { Match } from '@app/classes/match/match';
import { UserService } from '@app/services/user/user.service';
import {
    CHALLENGE_BRIDGE_WALKER_TARGET,
    CHALLENGE_COLLECTOR_TARGET,
    CHALLENGE_COMPLETION_REWARD,
    CHALLENGE_DUELIST_TARGET,
    CHALLENGE_INVINCIBLE_TARGET,
    CHALLENGE_TILE_BONUS,
} from '@common/consts/challenge-data.const';
import { REGULAR_ITEMS } from '@common/consts/map-data.const';
import { ChallengeType, PlayerChallengeData } from '@common/interfaces/challenge-data';
import { MapData } from '@common/interfaces/map-data';
import { TileType } from '@common/interfaces/tile-type.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ChallengeService {
    @Inject(forwardRef(() => UserService)) private userService: UserService;
    assignChallenge(mapData: MapData): PlayerChallengeData {
        const possible = this.getPossibleChallenges(mapData);
        const type = possible[Math.floor(Math.random() * possible.length)];
        return this.createChallenge(type, mapData);
    }

    async updateChallenges(match: Match): Promise<void> {
        for (const trackingPlayer of match.data.trackingData.players) {
            if (!trackingPlayer.challenge?.isCompleted) {
                continue;
            }
            await this.userService.updateUserChallenge(trackingPlayer.id, trackingPlayer.challenge);
        }
    }

    private getPossibleChallenges(mapData: MapData): ChallengeType[] {
        const possible: ChallengeType[] = [ChallengeType.Explorer, ChallengeType.Invincible, ChallengeType.Duelist];

        if (this.countAvailableItems(mapData) >= CHALLENGE_COLLECTOR_TARGET) {
            possible.push(ChallengeType.Collector);
        }

        if (this.countBridges(mapData) >= CHALLENGE_BRIDGE_WALKER_TARGET) {
            possible.push(ChallengeType.BridgeWalker);
        }

        return possible;
    }

    private createChallenge(type: ChallengeType, mapData: MapData): PlayerChallengeData {
        const cashGain = CHALLENGE_COMPLETION_REWARD;
        switch (type) {
            case ChallengeType.Explorer:
                return { type, isCompleted: false, progress: 0, target: mapData.size + CHALLENGE_TILE_BONUS, cashGain };
            case ChallengeType.Invincible:
                return { type, isCompleted: false, progress: 0, target: CHALLENGE_INVINCIBLE_TARGET, cashGain };
            case ChallengeType.Collector:
                return { type, isCompleted: false, progress: 0, target: CHALLENGE_COLLECTOR_TARGET, cashGain };
            case ChallengeType.BridgeWalker:
                return { type, isCompleted: false, progress: 0, target: CHALLENGE_BRIDGE_WALKER_TARGET, cashGain };
            case ChallengeType.Duelist:
                return { type, isCompleted: false, progress: 0, target: CHALLENGE_DUELIST_TARGET, cashGain };
        }
    }

    private countAvailableItems(mapData: MapData): number {
        let count = 0;
        for (const itemType of [...REGULAR_ITEMS, 'Random']) {
            count += mapData.items[itemType]?.length ?? 0;
        }
        return count;
    }

    private countBridges(mapData: MapData): number {
        let count = 0;
        for (const row of mapData.tiles) {
            for (const tile of row) {
                if (tile === TileType.Bridge || tile === TileType.BrokenBridge) count++;
            }
        }
        return count;
    }
}
