import { Match } from '@app/classes/match/match';
import { MovementService } from '@app/services/movement/movement.service';
import { MOVEMENT_ANIMATION_DURATION, TURN_START_DURATION, TURN_WAIT_DURATION } from '@common/consts/match-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, PlayerData, PlayerType } from '@common/interfaces/player-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PlayService {
    @Inject(MovementService) private readonly movementService: MovementService;

    endTurn(match: Match, playerId: string) {
        if (match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            this.startTurnStart(match);
        }
    }

    move(match: Match, playerId: string, position: Position) {
        if (match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const shortestPath = this.movementService.getShortestPath(match.data, position);

            if (shortestPath.moveCost <= match.data.playData.movementLeft) {
                const player = match.getPlayer(playerId);
                player.position = shortestPath.path[shortestPath.path.length - 1];
                match.data.playData.movementLeft -= shortestPath.moveCost;
                const elapsedTime = Math.abs(new Date().getTime() - match.lastTimeoutStart.getTime());
                match.data.playData.timeLeft = match.data.playData.timeLeft - elapsedTime;
                match.data.state = MatchState.MovementAnimation;
                match.sendUpdate();
                match.setTimeout(this.endOfMovementAnimation.bind(this, match, player), (shortestPath.path.length + 1) * MOVEMENT_ANIMATION_DURATION);
            }
        }
    }

    endOfMovementAnimation(match: Match, player: PlayerData) {
        match.data.state = MatchState.TurnWait;
        match.setTimeout(this.startTurnStart.bind(this, match), match.data.playData.timeLeft);
        this.checkAndPickupItem(match, player);
        match.sendUpdate();
    }

    // TODO: mettre en privee
    checkAndPickupItem(match: Match, playerData: PlayerData) {
        const position = playerData.position;

        for (const [itemType, positions] of Object.entries(match.data.gameData.mapData.items)) {
            if (itemType !== ItemType.Spawn) {
                const foundItem = positions.find((itemPos) => itemPos.x === position.x && itemPos.y === position.y);
                if (foundItem) {
                    if (this.handleItemAddition(match, playerData, itemType as ItemType)) {
                        match.data.gameData.mapData.items[itemType] = positions.filter((itemPos) => itemPos !== foundItem);
                        return;
                    }
                }
            }
        }
    }

    // TODO: mettre en privee
    handleItemAddition(match: Match, player: PlayerData, itemType: ItemType): boolean {
        if (player.items.length < 2 || player.type === PlayerType.Player) {
            player.items.push(itemType);

            if (player.items.length > 2) {
                const elapsedTime = Math.abs(new Date().getTime() - match.lastTimeoutStart.getTime());
                match.data.playData.timeLeft = match.data.playData.timeLeft - elapsedTime;
                match.data.state = MatchState.ItemDropSelection;
                match.clearTimeout();
            }

            this.computeItems(player);
            match.sendUpdate();
            return true;
        } else {
            // player is a bot and inventory is full
            return false;
        }
    }

    computeItems(player: PlayerData) {
        const hasItem1 = player.items.includes(ItemType.Item1);
        const hasItem2 = player.items.includes(ItemType.Item2);
        player.avatar = this.getAvatarVariant(player.avatar, hasItem1, hasItem2);
    }

    // TODO: mettre en privee
    getAvatarVariant(avatar: Avatar, isShiny: boolean, isEvolved: boolean): Avatar {
        if (avatar === Avatar.Default) return Avatar.Default;

        const baseMatch = avatar.match(/^(avatar\d+)/);
        if (!baseMatch) {
            // eslint-disable-next-line no-console
            console.log('Invalid avatar', avatar);
            return avatar;
        }

        const base = baseMatch[1];
        let result = base;

        if (isEvolved) {
            result += '-evolved';
        }
        if (isShiny) {
            result += '-shiny';
        }

        // eslint-disable-next-line no-console
        console.log('getAvatarVariant', avatar, result as Avatar);

        return result as Avatar;
    }

    dropItem(match: Match, playerId: string, itemType: ItemType) {
        const player = match.getPlayer(playerId);
        player.items = player.items.filter((i) => i !== itemType);
        match.data.gameData.mapData.items[itemType].push(player.position);

        match.data.state = MatchState.TurnWait;
        match.setTimeout(this.startTurnStart.bind(this, match), match.data.playData.timeLeft);
        this.computeItems(player);
        match.sendUpdate();
    }

    action(match: Match, playerId: string, position: Position) {
        if (match.data.playData.hasAction && match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const actions = this.movementService.getActions(match.data);
            if (actions.some((a) => a.x === position.x && a.y === position.y)) {
                match.data.playData.hasAction = false;
                this.executeAction(match, playerId, position);
            }
        }
    }

    debugMove(match: Match, playerId: string, position: Position) {
        if (match.data.playData.isDebugMode && match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const possibleMoves = this.movementService.getPossibleMovesDebug(match.data);
            const isMoveValid = possibleMoves.some((m) => m.x === position.x && m.y === position.y);
            if (isMoveValid) {
                const player = match.getPlayer(playerId);
                player.position = position;
                match.sendUpdate();
            }
        }
    }

    changeDebugMode(match: Match, playerId: string, isDebugMode: boolean) {
        if (match.isHost(playerId) && match.isActivePlayer(playerId)) {
            match.data.playData.isDebugMode = isDebugMode;
            match.sendMessage(isDebugMode ? Message.DebugModeOn : Message.DebugModeOff);
        }
    }

    startTurnStart(match: Match) {
        match.data.state = MatchState.TurnStart;
        match.data.playData.hasAction = false;
        match.data.playData.movementLeft = 0;
        match.data.playData.timeLeft = TURN_WAIT_DURATION;
        match.data.playData.activePlayerIndex = this.getNextPlayerIndex(match);

        match.setTimeout(this.startTurnWait.bind(this, match), TURN_START_DURATION);
        const playerName = match.data.players[match.data.playData.activePlayerIndex].name;
        match.sendMessage(`Début du tour de ${playerName}`);
    }

    private startTurnWait(match: Match) {
        match.data.state = MatchState.TurnWait;
        match.data.playData.hasAction = true;
        match.data.playData.movementLeft = match.data.players[match.data.playData.activePlayerIndex].speed;

        match.setTimeout(this.startTurnStart.bind(this, match), TURN_WAIT_DURATION);
        match.sendUpdate();
    }

    private executeAction(match: Match, playerId: string, position: Position) {
        const targetPlayer = match.data.players.find((p) => p.position.x === position.x && p.position.y === position.y);
        if (targetPlayer) {
            this.startFight(match, playerId, targetPlayer.id);
        } else {
            this.toggleBridgeTile(match, position);
            match.sendUpdate();
        }
    }

    private toggleBridgeTile(match: Match, position: Position) {
        const tile = match.data.gameData.mapData.tiles[position.x][position.y];
        if (tile === TileType.Bridge) {
            match.data.gameData.mapData.tiles[position.x][position.y] = TileType.BrokenBridge;
        } else if (tile === TileType.BrokenBridge) {
            match.data.gameData.mapData.tiles[position.x][position.y] = TileType.Bridge;
        }
    }

    private getNextPlayerIndex(match: Match): number {
        let nextIndex = (match.data.playData.activePlayerIndex + 1) % match.data.players.length;
        let steps = 0;
        while (steps <= match.data.players.length && !match.data.players[nextIndex].isConnected) {
            nextIndex = (nextIndex + 1) % match.data.players.length;
            steps++;
        }
        return nextIndex;
    }

    private startFight(match: Match, playerId: string, targetPlayerId: string) {
        // TODO
        // eslint-disable-next-line no-console
        console.log('startFight', match.data.state, playerId, targetPlayerId);
        match.sendUpdate();
    }

    // private respawnPlayer(playerId: string, matchCode: string) {
    //     const match = this.matchService.getMatch(matchCode);
    //     if (match) {
    //         const player = this.matchService.getPlayer(match.matchData.code, playerId);
    //         if (player && player.isConnected) {
    //             if (player.spawnPoint !== player.currentStats.position) {
    //                 const position = this.movementService.getNearestEmptyTile(player.spawnPoint, match);
    //                 player.currentStats.position = position;
    //             }
    //         }
    //     }
    // }
}
