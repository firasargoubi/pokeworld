import { Match } from '@app/classes/match/match';
import { Channel as ChannelDoc, ChannelDocument } from '@app/model/schema/channel.schema';
import { ITEM_NAME } from '@common/consts/item-data.const';
import { RESERVED_CHANNEL_NAMES } from '@common/consts/reserved-channel-names.const';
import { Channel } from '@common/interfaces/channel';
import { ChatLog } from '@common/interfaces/chat-message';
import { ItemType } from '@common/interfaces/item-type.enum';
import { PlayerCombatData } from '@common/interfaces/match-data';
import { Message } from '@common/interfaces/message.enum';
import { Position } from '@common/interfaces/position';
import { TileType } from '@common/interfaces/tile-type.enum';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
    constructor(@InjectModel(ChannelDoc.name) private channelModel: Model<ChannelDocument>) {
        this.channelModel.deleteMany({ name: { $regex: '^\\d{4}$' } }).exec();
    }

    async createChannel(channelName: string, userName: string, isDedicatedChannel: boolean = false): Promise<Channel | null> {
        if (!channelName) return null;

        channelName = channelName.trim();
        const isNameTaken = await this.channelModel.exists({ name: channelName });
        const channelNameIsNotAllowed = RESERVED_CHANNEL_NAMES.includes(channelName.toLowerCase());
        const forbiddenCharactersRegex = /^\d{4}$/.test(channelName);
        if (isNameTaken || ((channelNameIsNotAllowed || forbiddenCharactersRegex) && !isDedicatedChannel)) return null;

        const newChannel = new this.channelModel({ name: channelName, membersUsernames: [userName], isDedicatedChannel });
        const savedChannel = await newChannel.save();
        return { name: savedChannel.name, membersUsernames: savedChannel.membersUsernames };
    }

    async joinChannel(channelName: string, userName: string): Promise<void> {
        await this.channelModel.updateOne({ name: channelName, membersUsernames: { $ne: userName } }, { $push: { membersUsernames: userName } });
    }

    async leaveChannel(channelName: string, userName: string): Promise<void> {
        const channel = await this.channelModel.findOneAndUpdate({ name: channelName }, { $pull: { membersUsernames: userName } }, { new: true });
        if (!channel) return;

        const hasNoMembers = channel.membersUsernames.length === 0;
        if (hasNoMembers) {
            await this.channelModel.deleteOne({ name: channelName });
        }
    }

    async deleteChannel(channelName: string): Promise<void> {
        await this.channelModel.deleteOne({ name: channelName });
    }

    async isUserInChannel(channelName: string, userName: string): Promise<boolean> {
        if (!channelName || !userName) return false;
        const exists = await this.channelModel.exists({ name: channelName, membersUsernames: userName });
        return exists !== null;
    }

    async getChannels(): Promise<Channel[]> {
        const channels = await this.channelModel.find({ isDedicatedChannel: false }).lean().exec();
        return channels.map((channel) => ({ name: channel.name, membersUsernames: channel.membersUsernames }));
    }

    logItemPickup(match: Match, name: string, itemType: ItemType) {
        this.addLogToMatch(match, 'server.logs.itemPickup', [], {
            playerName: name,
            itemName: ITEM_NAME[itemType],
        });
    }

    logDebugMode(match: Match, isDebugMode: boolean) {
        const message = isDebugMode ? Message.DebugModeOn : Message.DebugModeOff;
        this.addLogToMatch(match, message);
    }

    logPlayerTurnStart(match: Match, playerName: string) {
        this.addLogToMatch(match, 'server.logs.turnStart', [], { playerName });
    }

    logMatchWinner(match: Match, playerName: string) {
        this.addLogToMatch(match, 'server.logs.matchWinner', [], { playerName });
    }

    logEndMatch(match: Match) {
        const activePlayersNames = match.data.players.filter((player) => player.isConnected).map((player) => player.name);
        const formattedPlayersList =
            activePlayersNames.length === 1
                ? activePlayersNames[0]
                : activePlayersNames.slice(0, -1).join(', ') + ' et ' + activePlayersNames[activePlayersNames.length - 1];
        this.addLogToMatch(match, 'server.logs.endMatch', [], { playersList: formattedPlayersList });
    }

    logCombatStart(match: Match, engagingPlayerName: string, targetPlayerName: string) {
        this.addLogToMatch(match, 'server.logs.combatStart', [], {
            engagingPlayerName,
            targetPlayerName,
        });
    }

    logBridgeToggled(match: Match, playerName: string, position: Position) {
        const isRepaired = match.data.gameData.mapData.tiles[position.x][position.y] === TileType.Bridge;
        const message = isRepaired ? 'server.logs.bridgeRepaired' : 'server.logs.bridgeBroken';
        this.addLogToMatch(match, message, [], { playerName });
    }

    logEscapeAttempt(match: Match, isSuccessful: boolean, escapingPlayer: PlayerCombatData) {
        const message = isSuccessful ? 'server.logs.escapeAttempt.success' : 'server.logs.escapeAttempt.fail';
        this.addLogToMatch(match, message, this.getConcernedPlayers(match), {
            playerName: this.getPlayerName(match, escapingPlayer),
        });
    }

    logAttack(match: Match, attackingPlayerData: PlayerCombatData) {
        this.addLogToMatch(match, 'server.logs.attack', this.getConcernedPlayers(match), {
            playerName: this.getPlayerName(match, attackingPlayerData),
            attack: attackingPlayerData.attack,
            rolledAttack: match.data.combatData.lastRolledAttack,
        });
    }

    logDefense(match: Match, defendingPlayerData: PlayerCombatData) {
        this.addLogToMatch(match, 'server.logs.defense', this.getConcernedPlayers(match), {
            playerName: this.getPlayerName(match, defendingPlayerData),
            defense: defendingPlayerData.defense,
            rolledDefense: match.data.combatData.lastRolledDefense,
        });
    }

    logAttackResult(match: Match, attackResult: number) {
        if (attackResult > 0) {
            this.addLogToMatch(match, 'server.logs.attackResult.damage', this.getConcernedPlayers(match), { attackResult });
        } else {
            this.addLogToMatch(match, 'server.logs.attackResult.blocked', this.getConcernedPlayers(match));
        }
    }

    logCombatEnd(match: Match, concernedPlayers: PlayerCombatData, isDead: boolean) {
        const activePlayerName = this.getPlayerName(match, concernedPlayers);
        const message = isDead ? 'server.logs.combatEnd.victory' : 'server.logs.combatEnd.escape';
        this.addLogToMatch(match, message, [], { playerName: activePlayerName });
    }

    logPlayerLeft(match: Match, playerId: string) {
        const leavingPlayer = match.data.players.find((player) => player.id === playerId);
        if (leavingPlayer) {
            this.addLogToMatch(match, 'server.logs.playerLeft', [], { playerName: leavingPlayer.name });
        }
    }

    private addLogToMatch(match: Match, message: string, concernedPlayers: string[] = [], messageParams?: Record<string, string | number | boolean>) {
        const log: ChatLog = {
            content: message,
            timestamp: new Date(),
            concernedPlayersNamesList: concernedPlayers,
        };
        if (messageParams) {
            log.messageParams = messageParams;
        }
        match.data.logData.push(log);
        match.sendUpdate();
    }

    private getConcernedPlayers(match: Match): string[] {
        const combatPlayerData = match.data.combatData.playersCombatData;
        return combatPlayerData.map((playerData) => {
            return this.getPlayerName(match, playerData);
        });
    }

    private getPlayerName(match: Match, player: PlayerCombatData): string {
        return match.data.players[player.playerIndex].name;
    }
}
