import { CODE_LENGTH } from '@common/consts/match.const';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { MATCH_CODES, MATCHES, MOCK_MATCHES, PLAYER_TO_MATCH_CODE } from '@common/test-consts/mock-matches';
import { PLAYER_IDS } from '@common/test-consts/mock-players';
import { Test, TestingModule } from '@nestjs/testing';
import { createSandbox, SinonSandbox } from 'sinon';
import { MatchService } from './match.service';
import { DEFAULT_TURN_DATA } from './match.service.const';

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
        const result = service.createMatch(structuredClone(MOCK_GAME_DATAS[0]));
        expect(service['matches'].has(matchCode)).toBeTruthy();
        expect(result).toBe(matchCode);
    });

    it('should getPlayerIndex correctly', () => {
        const playerId = PLAYER_IDS[0];
        const matchCode = MATCH_CODES[0];
        const getPlayersSpy = sandbox.spy(service, 'getPlayers');

        const result = service.getPlayerIndex(matchCode, playerId);

        expect(result).toBe(0);
        expect(getPlayersSpy.calledWith(matchCode)).toBe(true);
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
        const matchCode = MATCH_CODES[0];
        service.addPlayerToMatch(playerIdAdmin, matchCode, true);
        expect(service.isPlayerAdmin(playerIdAdmin, matchCode)).toBe(true);
        const playerIdNonAdmin = '3344';
        service.addPlayerToMatch(playerIdNonAdmin, matchCode, false);
        expect(service.isPlayerAdmin(playerIdNonAdmin, matchCode)).toBe(false);
    });

    it('should getUniqueName correctly', () => {
        const name = 'bob';
        const newPlayerId = '4111';
        const matchCode = MATCH_CODES[0];
        service.addPlayerToMatch(newPlayerId, matchCode, false);
        expect(service.getUniqueName(name, newPlayerId, matchCode)).toBe(name);
        service.getPlayer(matchCode, structuredClone(PLAYER_IDS[0])).name = name;
        expect(service.getUniqueName(name, newPlayerId, matchCode)).toBe(`${name}-2`);
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
        const matchCode = MATCH_CODES[0];
        service.addPlayerToMatch(playerId, matchCode, false);
        expect(service.isPlayerInMatch(playerId)).toBe(true);
        service.removePlayerFromMatch(playerId, matchCode, true);
        expect(service.isPlayerInMatch(playerId)).toBe(false);
    });

    it('should delete match if no player is left', () => {
        const matchCode = MATCH_CODES[0];
        expect(service.hasMatchCode(matchCode)).toBe(true);
        [PLAYER_IDS[0], PLAYER_IDS[1], PLAYER_IDS[2], PLAYER_IDS[3]].forEach((playerId) => {
            service.removePlayerFromMatch(playerId, matchCode, true);
        });
        expect(service.hasMatchCode(matchCode)).toBe(false);
        expect(service['turnDatas'].has(matchCode)).toBe(false);
    });

    it('should getMatchCode correctly', () => {
        const result = service.getMatchCode(structuredClone(PLAYER_IDS[0]));
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
        service.createMatch(structuredClone(MOCK_GAME_DATAS[0]));
        expect(service.hasMatchCode(matchCode)).toBe(true);
    });

    it('should getPlayers correctly', () => {
        const result = service.getPlayers(structuredClone(MATCH_CODES[0]));
        expect(result).toEqual(MATCHES.get(structuredClone(MATCH_CODES[0])).matchData.players);
    });

    it('should getPlayers correctly', () => {
        const result = service.getPlayers(structuredClone(MATCH_CODES[0]));
        expect(result).toEqual(MATCHES.get(structuredClone(MATCH_CODES[0])).matchData.players);
    });

    it('should correctly identify active player', () => {
        const matchCode = MATCH_CODES[0];
        const match = service['matches'].get(matchCode);
        match.matchData.activePlayer = 0;
        const activePlayerId = match.matchData.players[0].id;
        expect(service.isActivePlayer(matchCode, activePlayerId)).toBe(true);
        expect(service.isActivePlayer(matchCode, PLAYER_IDS[1])).toBe(false);
        expect(service.isActivePlayer(matchCode, 'unknown')).toBe(false);
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

        [PLAYER_IDS[0], PLAYER_IDS[1], PLAYER_IDS[2], PLAYER_IDS[3]].forEach((playerId) => {
            service.removePlayerFromMatch(playerId, matchCode, true);
        });

        expect(service.hasMatchCode(matchCode)).toBe(false);
        expect(service['turnDatas'].has(matchCode)).toBe(false);
        expect(clearTimeoutSpy.calledOnceWith(fakeTimeout)).toBe(true);
    });
});
