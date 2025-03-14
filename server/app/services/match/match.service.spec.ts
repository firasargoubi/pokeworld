import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { createSandbox, SinonSandbox } from 'sinon';
import { MOCK_GAMES } from '@app/consts/tests/mock-games';
import { MACTHES, MATCH_CODES, PLAYER_IDS, PLAYER_TO_MATCH_CODE } from './match.service.spec.const';
import { CODE_LENGTH } from './match.service.const';
import { MOCK_MATCHES } from '@app/consts/tests/mock-matches';

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
        service['matches'] = structuredClone(MACTHES);
        service['playerToMatchCode'] = structuredClone(PLAYER_TO_MATCH_CODE);
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
        expect(service.hasMatchCode(structuredClone(MATCH_CODES[0]))).toBe(true);
        service.getPlayers(MATCH_CODES[0]).forEach((player) => {
            service.removePlayerFromMatch(player.id, MATCH_CODES[0]);
        });
        expect(service.hasMatchCode(structuredClone(MATCH_CODES[0]))).toBe(false);
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
        expect(result).toEqual(MACTHES.get(structuredClone(MATCH_CODES[0])).matchData.players);
    });

    it('should getPlayer correctly', () => {
        const result = service.getPlayer(structuredClone(PLAYER_IDS[0]));
        expect(result.id).toBe(structuredClone(PLAYER_IDS[0]));
    });

    it('should getPlayersFromPlayerId correctly', () => {
        const result = service.getPlayersFromPlayerId(structuredClone(PLAYER_IDS[0]));
        expect(result).toEqual(MACTHES.get(structuredClone(MATCH_CODES[0])).matchData.players);
    });
});
