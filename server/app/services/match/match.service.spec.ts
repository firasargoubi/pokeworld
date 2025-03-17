import { MOCK_GAMES } from '@app/consts/tests/mock-games';
import { MOCK_MATCHES } from '@app/consts/tests/mock-matches';
import { Test, TestingModule } from '@nestjs/testing';
import { createSandbox, SinonSandbox } from 'sinon';
import { MatchService } from './match.service';
import { CODE_LENGTH, DEFAULT_TURN_DATA } from './match.service.const';
import { MATCH_CODES, MATCHES, PLAYER_IDS, PLAYER_TO_MATCH_CODE } from './match.service.spec.const';

describe('MatchService', () => {
    let service: MatchService;
    let sandbox: SinonSandbox;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchService],
        }).compile();

        service = module.get<MatchService>(MatchService);
    });

    beforeEach(() => {
        sandbox = createSandbox();
        service['matches'] = structuredClone(MATCHES);
        service['playerToMatchCode'] = structuredClone(PLAYER_TO_MATCH_CODE);
        service['turnDatas'] = new Map([
            [MATCH_CODES[0], structuredClone(DEFAULT_TURN_DATA)],
            [MATCH_CODES[1], structuredClone(DEFAULT_TURN_DATA)],
        ]);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should createMatch correctly', () => {
        const matchCode = '1234';
        sandbox.stub(service, 'getNewMatchCode').returns(matchCode);
        const result = service.createMatch(structuredClone(MOCK_GAMES[0]));
        expect(service['matches'].has(matchCode)).toBeTruthy();
        expect(result).toBe(matchCode);
    });

    it('should getPlayerIndex correctly', () => {
        const playerId = PLAYER_IDS[0];
        const getMatchCodeFromPlayerIdSpy = sandbox.spy(service, 'getMatchCodeFromPlayerId');
        const getPlayersSpy = sandbox.spy(service, 'getPlayers');

        const result = service.getPlayerIndex(playerId);

        expect(result).toBe(0);
        expect(getMatchCodeFromPlayerIdSpy.calledWith(playerId)).toBe(true);
        expect(getPlayersSpy.calledWith(MATCH_CODES[0])).toBe(true);
    });

    it('should detect isPlayerInMatch correctly', () => {
        const playerId = '7777';
        expect(service.isPlayerInMatch(playerId)).toBe(false);
        service.addPlayerToMatch(playerId, structuredClone(MATCH_CODES[0]), false);
        expect(service.isPlayerInMatch(playerId)).toBe(true);
    });

    it('should getIsMatchStarted correctly', () => {
        expect(service.getIsMatchStarted(structuredClone(MATCH_CODES[0]))).toBe(false);
    });

    it('should detect isPlayerAdmin correctly', () => {
        const playerIdAdmin = '1122';
        service.addPlayerToMatch(playerIdAdmin, structuredClone(MATCH_CODES[0]), true);
        expect(service.isPlayerAdmin(playerIdAdmin)).toBe(true);
        const playerIdNonAdmin = '3344';
        service.addPlayerToMatch(playerIdNonAdmin, structuredClone(MATCH_CODES[0]), false);
        expect(service.isPlayerAdmin(playerIdNonAdmin)).toBe(false);
    });

    it('should getUniqueName correctly', () => {
        const name = 'bob';
        const newPlayerId = '4111';
        service.addPlayerToMatch(newPlayerId, structuredClone(MATCH_CODES[0]), false);
        expect(service.getUniqueName(name, newPlayerId)).toBe(name);
        service.getPlayer(structuredClone(PLAYER_IDS[0])).name = name;
        expect(service.getUniqueName(name, newPlayerId)).toBe(`${name}-2`);
    });

    it('should getNewMatchCode correctly', () => {
        sandbox.stub(service, 'hasMatchCode').returns(false);
        const result = service.getNewMatchCode();
        expect(result.length).toBe(CODE_LENGTH);
    });

    it('should getMatch correctly', () => {
        const result = service.getMatch(structuredClone(MATCH_CODES[0]));
        expect(result).toEqual(structuredClone(MOCK_MATCHES[0]));
    });

    it('should removePlayerFromMatch correctly', () => {
        const playerId = '9090';
        service.addPlayerToMatch(playerId, structuredClone(MATCH_CODES[0]), false);
        expect(service.isPlayerInMatch(playerId)).toBe(true);
        service.removePlayerFromMatch(playerId, structuredClone(MATCH_CODES[0]));
        expect(service.isPlayerInMatch(playerId)).toBe(false);
    });

    it('should delete match if no player is left', () => {
        const matchCode = MATCH_CODES[0];
        expect(service.hasMatchCode(matchCode)).toBe(true);
        [PLAYER_IDS[0], PLAYER_IDS[1]].forEach((playerId) => {
            service.removePlayerFromMatch(playerId, matchCode);
        });
        expect(service.hasMatchCode(matchCode)).toBe(false);
        expect(service['turnDatas'].has(matchCode)).toBe(false);
    });

    it('should getMatchCodeFromPlayerId correctly', () => {
        const result = service.getMatchCodeFromPlayerId(structuredClone(PLAYER_IDS[0]));
        expect(result).toBe(structuredClone(MATCH_CODES[0]));
    });

    it('should setMatchLockState correctly', () => {
        service.setMatchLockState(structuredClone(MATCH_CODES[0]), true);
        expect(service.getMatch(structuredClone(MATCH_CODES[0])).matchData.isLocked).toBe(true);
        service.setMatchLockState(structuredClone(MATCH_CODES[0]), false);
        expect(service.getMatch(structuredClone(MATCH_CODES[0])).matchData.isLocked).toBe(false);
    });

    it('should addPlayerToMatch correctly', () => {
        const playerId = '8000';
        service.addPlayerToMatch(playerId, structuredClone(MATCH_CODES[0]), false);
        expect(service.isPlayerInMatch(playerId)).toBe(true);
    });

    it('should check if hasMatchCode correctly', () => {
        const matchCode = '3300';
        sandbox.stub(service, 'getNewMatchCode').returns(matchCode);
        expect(service.hasMatchCode(matchCode)).toBe(false);
        service.createMatch(structuredClone(MOCK_GAMES[0]));
        expect(service.hasMatchCode(matchCode)).toBe(true);
    });

    it('should getPlayers correctly', () => {
        const result = service.getPlayers(structuredClone(MATCH_CODES[0]));
        expect(result).toEqual(MATCHES.get(structuredClone(MATCH_CODES[0])).matchData.players);
    });

    it('should getPlayer correctly', () => {
        const result = service.getPlayer(structuredClone(PLAYER_IDS[0]));
        expect(result.id).toBe(structuredClone(PLAYER_IDS[0]));
    });

    it('should getPlayersFromPlayerId correctly', () => {
        const result = service.getPlayersFromPlayerId(structuredClone(PLAYER_IDS[0]));
        expect(result).toEqual(MATCHES.get(structuredClone(MATCH_CODES[0])).matchData.players);
    });

    it('should correctly identify active player', () => {
        const matchCode = MATCH_CODES[0];
        const match = service['matches'].get(matchCode);
        match.matchData.activePlayer = 0;
        const activePlayerId = match.matchData.players[0].id;
        expect(service.isActivePlayer(activePlayerId)).toBe(true);
        expect(service.isActivePlayer(PLAYER_IDS[1])).toBe(false);
        expect(service.isActivePlayer('unknown')).toBe(false);
    });

    it('should get turn data correctly', () => {
        const turnData = service.getTurnData(MATCH_CODES[0]);
        expect(turnData).toEqual(structuredClone(DEFAULT_TURN_DATA));
        expect(service.getTurnData('unknown')).toBeUndefined();
    });

    it('should clear timeout in removePlayerFromMatch when phaseTimeout is set', () => {
        const matchCode = MATCH_CODES[0];
        const turnData = service['turnDatas'].get(matchCode);
        const fakeTimeout = {} as NodeJS.Timeout;
        turnData.phaseTimeout = fakeTimeout;

        const clearTimeoutSpy = sandbox.spy(global, 'clearTimeout');

        [PLAYER_IDS[0], PLAYER_IDS[1]].forEach((playerId) => {
            service.removePlayerFromMatch(playerId, matchCode);
        });

        expect(service.hasMatchCode(matchCode)).toBe(false);
        expect(service['turnDatas'].has(matchCode)).toBe(false);
        expect(clearTimeoutSpy.calledOnceWith(fakeTimeout)).toBe(true);
    });
});
