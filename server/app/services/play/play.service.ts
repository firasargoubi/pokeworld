import { Match } from '@app/classes/match/match';
import { ChatService } from '@app/services/chat/chat.service';
import { CombatService } from '@app/services/combat/combat.service';
import { MapService } from '@app/services/map/map.service';
import {
    DROP_ITEMS_DURATION,
    MATCH_END_DURATION,
    MINIMUM_COMBATS_TO_WIN,
    MOVEMENT_ANIMATION_DURATION,
    TURN_START_DURATION,
    TURN_WAIT_DURATION,
} from '@common/consts/match-data.const';
import { AVATAR_EVOLVED_SUFFIX, AVATAR_SHINY_SUFFIX, MAX_ITEMS } from '@common/consts/player-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { GameMode } from '@common/interfaces/map-data';
import { MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar, AvatarModifiers, PlayerData } from '@common/interfaces/player-data';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PlayService {
    @Inject(MapService) private readonly mapService: MapService;
    @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService;
    @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService;

    endTurn(match: Match, playerId: string) {
        if (match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            this.startNextTurn(match);
        }
    }

    move(match: Match, playerId: string, position: Position) {
        if (match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const shortestPath = this.mapService.getShortestPath(match.data, position);

            if (shortestPath.moveCost <= match.data.playData.movementLeft) {
                match.getPlayer(playerId).position = shortestPath.path[shortestPath.path.length - 1];
                match.data.playData.movementLeft -= shortestPath.moveCost;

                match.data.state = MatchState.MovementAnimation;
                this.setTimeLeft(match);
                match.sendUpdate();
                match.setTimeout(this.continueTurn.bind(this, match), (shortestPath.path.length + 1) * MOVEMENT_ANIMATION_DURATION);
            }
        }
    }

    dropItems(match: Match, playerId: string, items: ItemType[]) {
        const player = match.getPlayer(playerId);
        for (const item of items) {
            const position = this.mapService.getNearestItemDropSpot(match.data, player.position);
            match.data.gameData.mapData.items[item].push(position);
            player.items = player.items.filter((i) => i !== item);
        }
        this.computeItems(player);
        match.sendUpdate();
    }

    action(match: Match, playerId: string, position: Position) {
        if (match.data.playData.hasAction && match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const actions = this.mapService.getActions(match.data);
            if (actions.some((a) => a.x === position.x && a.y === position.y)) {
                match.data.playData.hasAction = false;
                this.executeAction(match, playerId, position);
            }
        }
    }
    debugMove(match: Match, playerId: string, position: Position) {
        if (match.data.playData.isDebugMode && match.isActivePlayer(playerId) && match.isState([MatchState.TurnWait])) {
            const possibleMoves = this.mapService.getPossibleMovesDebug(match.data);
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
            this.chatService.logDebugMode(match, isDebugMode);
        }
    }

    startNextTurn(match: Match) {
        match.data.state = MatchState.TurnStart;
        match.data.playData.hasAction = false;
        match.data.playData.movementLeft = 0;
        match.data.playData.timeLeft = TURN_WAIT_DURATION;
        match.data.playData.activePlayerIndex = this.getNextPlayerIndex(match);

        if (this.checkWinCondition(match)) {
            match.setTimeout(this.endMatch.bind(this, match), MATCH_END_DURATION);
        } else {
            const playerName = match.data.players[match.data.playData.activePlayerIndex].name;
            match.sendMessage(`Début du tour de ${playerName}`);
            this.chatService.logPlayerTurnStart(match, playerName);
            match.setTimeout(this.startTurnWait.bind(this, match), TURN_START_DURATION);
        }
    }

    continueTurn(match: Match) {
        const curentPlayer = match.data.players[match.data.playData.activePlayerIndex];
        if (this.checkWinCondition(match)) {
            match.setTimeout(this.endMatch.bind(this, match), MATCH_END_DURATION);
        } else {
            if (match.data.state === MatchState.MovementAnimation) {
                this.checkAndPickupItem(match, curentPlayer);
            }
            if (match.data.state === MatchState.ItemDropSelection) {
                this.scheduleForceItemDrop(match, curentPlayer.id);
            } else if (this.canPlayerAct(match)) {
                this.scheduleTurnEnd(match);
            } else {
                this.startNextTurn(match);
            }
        }
    }

    private canPlayerAct(match: Match): boolean {
        const hasPossibleActions = this.mapService.getActions(match.data).length > 0;
        const canUseAction = hasPossibleActions && match.data.playData.hasAction;
        const canMove = this.mapService.getPossibleMoves(match.data).length > 0;
        const canAct = canUseAction || canMove;
        const isConnected = match.data.players[match.data.playData.activePlayerIndex].isConnected;
        return canAct && isConnected;
    }

    private scheduleForceItemDrop(match: Match, playerId: string): void {
        this.setTimeLeft(match);
        match.sendUpdate();
        match.setTimeout(this.forceItemDrop.bind(this, match, playerId), DROP_ITEMS_DURATION);
    }

    private scheduleTurnEnd(match: Match): void {
        match.data.state = MatchState.TurnWait;
        match.sendUpdate();
        match.setTimeout(this.startNextTurn.bind(this, match), match.data.playData.timeLeft);
    }

    private checkWinCondition(match: Match): boolean {
        if (match.data.gameData.mapData.gameMode === GameMode.CTF) {
            return this.checkWinConditionCtf(match);
        } else {
            return this.checkWinConditionFfa(match);
        }
    }

    private checkWinConditionFfa(match: Match): boolean {
        const winner = match.data.players.find((p) => p.combatsWon >= MINIMUM_COMBATS_TO_WIN);
        if (winner) {
            match.data.state = MatchState.MatchEnd;
            match.sendMessage(`${winner.name} à gagné la partie`);
            this.chatService.logMatchWinner(match, winner.name);
        }
        return Boolean(winner);
    }

    private endMatch(match: Match) {
        match.data.state = MatchState.Statistics;
        this.chatService.logEndMatch(match);

        match.sendUpdate();
        match.clearTimeout();
    }

    private checkWinConditionCtf(match: Match): boolean {
        let result = false;
        // TODO check win condition for CTF games, return TRUE if game is over, return FALSE if game should continue

        if (Math.random() === 0) {
            match.data.state = MatchState.MatchEnd;
            match.sendMessage('Les rouges remporte la partie');
            result = true;
        }

        return result;
    }

    private setTimeLeft(match: Match) {
        const elapsedTime = Math.abs(new Date().getTime() - match.lastTimeoutStart.getTime());
        match.data.playData.timeLeft = match.data.playData.timeLeft - elapsedTime;
    }

    private startTurnWait(match: Match) {
        match.data.state = MatchState.TurnWait;
        match.data.playData.hasAction = true;
        match.data.playData.movementLeft = match.data.players[match.data.playData.activePlayerIndex].speed;
        match.sendUpdate();
        match.setTimeout(this.startNextTurn.bind(this, match), TURN_WAIT_DURATION);
    }

    private executeAction(match: Match, playerId: string, position: Position) {
        const player = match.getPlayer(playerId);
        const targetPlayer = match.data.players.find((p) => p.position.x === position.x && p.position.y === position.y);
        if (targetPlayer) {
            this.setTimeLeft(match);
            this.combatService.startCombat(match, playerId, targetPlayer.id);
            this.chatService.logCombatStart(match, player.name, targetPlayer.name);
        } else {
            this.toggleBridgeTile(match, position);
            this.chatService.logBridgeToggled(match, player.name);
            this.continueTurn(match);
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

    private checkAndPickupItem(match: Match, playerData: PlayerData) {
        const position = playerData.position;
        const item = this.mapService.getItemTypeAtPosition(match.data, position);
        if (item) {
            this.handleItemAddition(match, playerData, item);
        }
    }

    private handleItemAddition(match: Match, player: PlayerData, itemType: ItemType) {
        player.items.push(itemType);
        match.data.gameData.mapData.items[itemType] = match.data.gameData.mapData.items[itemType].filter(
            (itemPos) => itemPos.x !== player.position.x || itemPos.y !== player.position.y,
        );

        if (player.items.length > MAX_ITEMS) {
            match.data.state = MatchState.ItemDropSelection;
            return;
        }

        this.computeItems(player);
    }

    private forceItemDrop(match: Match, playerId: string) {
        match.data.state = MatchState.TurnWait;
        const player = match.getPlayer(playerId);
        this.dropItems(match, playerId, [player.items[MAX_ITEMS]]);
        this.continueTurn(match);
        match.sendUpdate();
    }

    private computeItems(player: PlayerData) {
        const isShiny = player.items.includes(ItemType.Item1);
        const isEvolved = player.items.includes(ItemType.Item2);
        const isMissingNo = player.items.includes(ItemType.Item6);
        player.avatar = this.getAvatarVariant(player.avatar, { isShiny, isEvolved, isMissingNo });
    }

    private getAvatarVariant(avatar: Avatar, avatarModifiers: AvatarModifiers): Avatar {
        const baseMatch = avatar.match(/^(avatar\d+)/);
        if (!baseMatch) {
            return avatar;
        }

        const base = baseMatch[1];
        let result = base;

        if (avatarModifiers.isEvolved) {
            result += AVATAR_EVOLVED_SUFFIX;
        }
        if (avatarModifiers.isShiny) {
            result += AVATAR_SHINY_SUFFIX;
        }

        return result as Avatar;
    }
}
