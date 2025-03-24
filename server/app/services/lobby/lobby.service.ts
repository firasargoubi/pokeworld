import { Match } from '@app/classes/match/match';
import { MatchState } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Avatar } from '@common/interfaces/player-data';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LobbyService {
    kickPlayer(match: Match, playerId: string, targetPlayerId: string) {
        const isHost = match.isHost(playerId);
        const isTryingToKickThemselve = playerId === targetPlayerId;

        if (isHost && !isTryingToKickThemselve) {
            match.kickPlayer(targetPlayerId, Message.Kick);
            match.sendUpdate();
        }
    }

    changeAvatar(match: Match, playerId: string, avatar: Avatar) {
        const player = match.getPlayer(playerId);
        player.avatar = avatar;
        match.sendUpdate();
    }

    joinLobby(match: Match, playerId: string, name: string) {
        const player = match.getPlayer(playerId);
        player.name = this.getUniqueName(match, playerId, name);
        player.isConnected = true;
        // TODO change player order
        match.sendUpdate();
    }

    changeLockStatus(match: Match, playerId: string, lockStatus: boolean) {
        if (match.isHost(playerId)) {
            match.changeLockStatus(lockStatus);
        }
    }

    startMatch(match: Match, playerId: string) {
        const isInLobby = match.data.state === MatchState.Lobby;
        const isLocked = match.data.lobbyData.isLocked;
        const isHost = match.isHost(playerId);
        if (isInLobby && isLocked && isHost) {
            this.startMatchFirstTurn(match);
        }
    }

    // eslint-disable-next-line no-unused-vars
    private startMatchFirstTurn(match: Match) {
        // TODO set match state, re-organize match, start timeout, sendUpdate
    }

    private getUniqueName(match: Match, playerId: string, name: string): string {
        let newName = name;
        let suffix = 2;
        while (match.data.players.some((p) => p.name === newName && p.id !== playerId)) {
            newName = `${name}-${suffix}`;
            suffix++;
        }
        return newName;
    }
}
