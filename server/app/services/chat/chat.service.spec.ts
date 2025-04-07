import { Match } from '@app/classes/match/match';
import { MAX_MESSAGE_LENGTH } from '@common/consts/chat-message.const';
import { ChatMessage } from '@common/interfaces/chat-message';
import { CombatData, PlayerCombatData } from '@common/interfaces/match-data';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { Test, TestingModule } from '@nestjs/testing';
import { createSandbox, createStubInstance, SinonSandbox, SinonStub, SinonStubbedInstance } from 'sinon';
import { SERVER_NAME } from './chat.consts';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let sandbox: SinonSandbox;
    let mockMatch: SinonStubbedInstance<Match>;
    let addLogToMatchStub: SinonStub;

    beforeEach(async () => {
        sandbox = createSandbox();

        mockMatch = createStubInstance<Match>(Match);
        mockMatch.data = structuredClone(MOCK_MATCH_DATAS[0]);
        mockMatch.data.chatData = [];
        mockMatch.data.logData = [];

        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);
        addLogToMatchStub = sandbox.stub(service, 'addLogToMatch');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should add valid message to chat data', () => {
        const message: ChatMessage = {
            sender: 'TestPlayer',
            content: 'Test message',
            timestamp: new Date(),
        };

        service.addMessageToMatch(mockMatch, message);

        expect(mockMatch.data.chatData.length).toBe(1);
        expect(mockMatch.data.chatData[0]).toEqual(message);
        expect(mockMatch.sendUpdate.calledOnce).toBe(true);
    });

    it('should reject message exceeding max length', () => {
        const longMessage: ChatMessage = {
            sender: 'TestPlayer',
            content: 'A'.repeat(MAX_MESSAGE_LENGTH + 1),
            timestamp: new Date(),
        };

        service.addMessageToMatch(mockMatch, longMessage);

        expect(mockMatch.data.chatData.length).toBe(0);
        expect(mockMatch.sendUpdate.called).toBe(false);
    });

    it('should add log with concerned players and without', () => {
        addLogToMatchStub.restore();

        const logMessage = 'Test log with players';
        const concernedPlayers = ['Player1', 'Player2'];

        service.addLogToMatch(mockMatch, logMessage, concernedPlayers);

        expect(mockMatch.data.logData.length).toBe(1);
        expect(mockMatch.data.logData[0].content).toBe(logMessage);
        expect(mockMatch.data.logData[0].concernedPlayersNamesList).toEqual(concernedPlayers);
        expect(mockMatch.sendUpdate.calledOnce).toBe(true);

        service.addLogToMatch(mockMatch, logMessage);
        expect(mockMatch.data.logData.length).toBe(2);
        expect(mockMatch.data.logData[1].content).toBe(logMessage);
        expect(mockMatch.data.logData[1].concernedPlayersNamesList).toEqual([]);
        expect(mockMatch.sendUpdate.calledTwice).toBe(true);
        expect(mockMatch.data.logData[1].sender).toBe(SERVER_NAME);
    });

    it('should log debug mode status', () => {
        service.logDebugMode(mockMatch, true);
        expect(addLogToMatchStub.firstCall.args[1]).toBe('Le mode de debug a été activé');

        service.logDebugMode(mockMatch, false);
        expect(addLogToMatchStub.secondCall.args[1]).toBe('Le mode de debug a été désactivé');
    });

    it('should log player turn start', () => {
        const playerName = 'TestPlayer';

        service.logPlayerTurnStart(mockMatch, playerName);

        expect(addLogToMatchStub.calledWith(mockMatch, `Début du tour de ${playerName}`)).toBeTruthy();
    });

    it('should log match winner', () => {
        const playerName = 'WinningPlayer';

        service.logMatchWinner(mockMatch, playerName);

        expect(addLogToMatchStub.calledWith(mockMatch, `${playerName} à gagné la partie`)).toBeTruthy();
    });

    it('should log end match with one player or a formatted player list', () => {
        mockMatch.data.players = [
            { ...mockMatch.data.players[0], name: 'Player1', isConnected: true },
            { ...mockMatch.data.players[1], name: 'Player2', isConnected: true },
            { ...mockMatch.data.players[2], name: 'Player3', isConnected: true },
        ];
        service.logEndMatch(mockMatch);
        expect(addLogToMatchStub.calledWith(mockMatch, 'Fin de partie. Joueurs actifs: Player1, Player2 et Player3')).toBeTruthy();

        mockMatch.data.players = [{ ...mockMatch.data.players[0], name: 'Player1', isConnected: true }];
        service.logEndMatch(mockMatch);
        expect(addLogToMatchStub.calledWith(mockMatch, 'Fin de partie. Joueurs actifs: Player1')).toBeTruthy();
    });

    it('should log combat start', () => {
        const attacker = 'AttackerPlayer';
        const defender = 'DefenderPlayer';

        service.logCombatStart(mockMatch, attacker, defender);

        expect(addLogToMatchStub.calledWith(mockMatch, `${attacker} a engagé un combat avec ${defender}`)).toBeTruthy();
    });

    it('should log bridge toggle', () => {
        const playerName = 'BridgeToggler';

        service.logBridgeToggled(mockMatch, playerName);

        expect(addLogToMatchStub.calledWith(mockMatch, `${playerName} a activé le pont`)).toBeTruthy();
    });

    it('should log escape attempt', () => {
        const playerData = { playerIndex: 0 } as PlayerCombatData;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getPlayerName').returns('EscapingPlayer');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getConcernedPlayers').returns(['Player1', 'Player2']);

        service.logEscapeAttempt(mockMatch, true, playerData);
        expect(addLogToMatchStub.firstCall.args[1]).toContain('Réussie');

        service.logEscapeAttempt(mockMatch, false, playerData);
        expect(addLogToMatchStub.secondCall.args[1]).toContain('Échouée');
    });

    it('should log attack information', () => {
        const attackerData = { playerIndex: 0, attack: 3 } as PlayerCombatData;
        mockMatch.data.combatData = {
            lastRolledAttack: 5,
            lastCombatAction: null,
            turnDuration: 0,
            isSecondPlayerTurn: false,
            playersCombatData: [],
        } as CombatData;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getPlayerName').returns('Attacker');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getConcernedPlayers').returns(['Player1', 'Player2']);

        service.logAttack(mockMatch, attackerData);

        const expectedMessage = 'Attacker attaque: [dé 5 + bonus 3]';
        expect(addLogToMatchStub.calledWith(mockMatch, expectedMessage, ['Player1', 'Player2'])).toBeTruthy();
    });

    it('should log defense information', () => {
        const defenderData = { playerIndex: 1, defense: 2 } as PlayerCombatData;
        mockMatch.data.combatData = {
            lastRolledDefense: 3,
            lastRolledAttack: 0,
            lastCombatAction: null,
            turnDuration: 0,
            isSecondPlayerTurn: false,
            playersCombatData: [],
        } as CombatData;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getPlayerName').returns('Defender');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getConcernedPlayers').returns(['Player1', 'Player2']);

        service.logDefense(mockMatch, defenderData);

        const expectedMessage = 'Defender se défend: [dé 3 + bonus 2]';
        expect(addLogToMatchStub.calledWith(mockMatch, expectedMessage, ['Player1', 'Player2'])).toBeTruthy();
    });

    it('should log attack result', () => {
        const attackResult = 3;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getConcernedPlayers').returns(['Player1', 'Player2']);

        service.logAttackResult(mockMatch, attackResult);
        expect(addLogToMatchStub.firstCall.args[1]).toBe("L'attaque inflige 3 dégâts.");

        service.logAttackResult(mockMatch, 0);
        expect(addLogToMatchStub.secondCall.args[1]).toBe("L'attaque est bloqué.");
    });

    it('should log combat end', () => {
        const playerData = { playerIndex: 0 } as PlayerCombatData;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getPlayerName').returns('CombatPlayer');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        sandbox.stub(service as any, 'getConcernedPlayers').returns(['Player1', 'Player2']);

        service.logCombatEnd(mockMatch, playerData, true);
        expect(addLogToMatchStub.firstCall.args[1]).toBe('CombatPlayer a été vaincu');

        service.logCombatEnd(mockMatch, playerData, false);
        expect(addLogToMatchStub.secondCall.args[1]).toBe("CombatPlayer s'est enfui du combat");
    });

    it('should log player left', () => {
        const playerId = '3333';
        mockMatch.data.players[0].id = playerId;
        mockMatch.data.players[0].name = 'LeavingPlayer';

        service.logPlayerLeft(mockMatch, playerId);

        expect(addLogToMatchStub.calledWith(mockMatch, 'LeavingPlayer a abandonné la partie')).toBeTruthy();
    });

    it('should get player name from combat data', () => {
        const playerData = { playerIndex: 1 } as PlayerCombatData;
        mockMatch.data.players[1].name = 'TestPlayerName';

        const result = service['getPlayerName'](mockMatch, playerData);

        expect(result).toBe('TestPlayerName');
    });

    it('should get concerned players from combat data', () => {
        mockMatch.data.combatData = {
            lastRolledAttack: 0,
            lastRolledDefense: 0,
            lastCombatAction: null,
            turnDuration: 0,
            isSecondPlayerTurn: false,
            playersCombatData: [{ playerIndex: 0 } as PlayerCombatData, { playerIndex: 1 } as PlayerCombatData],
        } as CombatData;
        mockMatch.data.players[0].name = 'Player1';
        mockMatch.data.players[1].name = 'Player2';

        const result = service['getConcernedPlayers'](mockMatch);

        expect(result).toEqual(['Player1', 'Player2']);
    });
});
