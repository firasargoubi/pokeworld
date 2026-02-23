import { Match } from '@app/classes/match/match';
import { Channel as ChannelDoc, ChannelDocument } from '@app/model/schema/channel.schema';
import { User } from '@app/model/schema/user.schema';
import { MAX_MESSAGE_LENGTH } from '@common/consts/chat-message.const';
import { ITEM_NAME } from '@common/consts/item-data.const';
import { Channel } from '@common/interfaces/channel';
import { ChatLog, ChatMessage } from '@common/interfaces/chat-message';
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
    constructor(@InjectModel(ChannelDoc.name) private channelModel: Model<ChannelDocument>) {}

    async createChannel(channelName: string, userName: string): Promise<Channel | null> {
        if (!channelName) return null;

        const isNameTaken = await this.channelModel.exists({ name: channelName });
        if (isNameTaken) return null;

        const newChannel = new this.channelModel({ name: channelName, membersUsernames: [userName] });
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

    async getChannels(): Promise<Channel[]> {
        const channels = await this.channelModel.find().lean().exec();
        return channels.map((channel) => ({ name: channel.name, membersUsernames: channel.membersUsernames }));
    }

    message(match: Match, playerId: string, message: string, user: User | null) {
        if (message.length <= MAX_MESSAGE_LENGTH) {
            const chatMessage: ChatMessage = {
                content: message,
                profilePicture: user ? user.profilePicture : null,
                sender: match.getPlayer(playerId).name,
                timestamp: new Date(),
            };
            match.data.chatData.push(chatMessage);
            match.sendUpdate();
        }
    }

    logItemPickup(match: Match, name: string, itemType: ItemType) {
        const message = `${name} a ramassé ${ITEM_NAME[itemType]}`;
        this.addLogToMatch(match, message);
    }

    logDebugMode(match: Match, isDebugMode: boolean) {
        const message = isDebugMode ? Message.DebugModeOn : Message.DebugModeOff;
        this.addLogToMatch(match, message);
    }

    logPlayerTurnStart(match: Match, playerName: string) {
        this.addLogToMatch(match, `Début du tour de ${playerName}`);
    }

    logMatchWinner(match: Match, playerName: string) {
        this.addLogToMatch(match, `${playerName} à gagné la partie`);
    }

    logEndMatch(match: Match) {
        const activePlayersNames = match.data.players.filter((player) => player.isConnected).map((player) => player.name);
        const formattedPlayersList =
            activePlayersNames.length === 1
                ? activePlayersNames[0]
                : activePlayersNames.slice(0, -1).join(', ') + ' et ' + activePlayersNames[activePlayersNames.length - 1];
        this.addLogToMatch(match, `Fin de partie avec ${formattedPlayersList}`);
    }

    logCombatStart(match: Match, engagingPlayerName: string, targetPlayerName: string) {
        this.addLogToMatch(match, engagingPlayerName + ' a engagé un combat avec ' + targetPlayerName);
    }

    logBridgeToggled(match: Match, playerName: string, position: Position) {
        const bridgeState = match.data.gameData.mapData.tiles[position.x][position.y] === TileType.Bridge ? 'réparé' : 'cassé';
        this.addLogToMatch(match, playerName + ' a ' + bridgeState + ' un pont');
    }

    logEscapeAttempt(match: Match, isSuccessful: boolean, escapingPlayer: PlayerCombatData) {
        const message = 'Tentative de fuite de ' + this.getPlayerName(match, escapingPlayer) + ' : ' + (isSuccessful ? 'Réussie' : 'Échouée');
        this.addLogToMatch(match, message, this.getConcernedPlayers(match));
    }

    logAttack(match: Match, attackingPlayerData: PlayerCombatData) {
        const message = `${this.getPlayerName(match, attackingPlayerData)} attaque (${attackingPlayerData.attack}) avec Dé (+${
            match.data.combatData.lastRolledAttack
        })`;
        this.addLogToMatch(match, message, this.getConcernedPlayers(match));
    }

    logDefense(match: Match, defendingPlayerData: PlayerCombatData) {
        const message = `${this.getPlayerName(match, defendingPlayerData)} se défend (${defendingPlayerData.defense}) avec Dé (+${
            match.data.combatData.lastRolledDefense
        })`;
        this.addLogToMatch(match, message, this.getConcernedPlayers(match));
    }

    logAttackResult(match: Match, attackResult: number) {
        const attackResultText = attackResult > 0 ? `inflige ${attackResult} dégâts` : 'est bloqué';
        const message = `L'attaque ${attackResultText}.`;
        this.addLogToMatch(match, message, this.getConcernedPlayers(match));
    }

    logCombatEnd(match: Match, concernedPlayers: PlayerCombatData, isDead: boolean) {
        const activePlayerName = this.getPlayerName(match, concernedPlayers);
        const message = isDead ? `${activePlayerName} a gagné le combat` : `${activePlayerName} s'est enfui du combat`;
        this.addLogToMatch(match, message);
    }

    logPlayerLeft(match: Match, playerId: string) {
        const leavingPlayer = match.data.players.find((player) => player.id === playerId);
        if (leavingPlayer) {
            const message = `${leavingPlayer.name} a abandonné la partie`;
            this.addLogToMatch(match, message);
        }
    }

    private addLogToMatch(match: Match, message: string, concernedPlayers: string[] = []) {
        const log: ChatLog = {
            content: message,
            timestamp: new Date(),
            concernedPlayersNamesList: concernedPlayers,
        };
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
