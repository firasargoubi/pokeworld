import { MOCK_MATCHES } from '@app/consts/tests/mock-matches';
import { MapData } from '@common/map-data';
import { Match } from '@common/match';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { MovementService } from './movement.service';

describe('MovementService', () => {
    let service: MovementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MovementService],
        }).compile();

        service = module.get<MovementService>(MovementService);
    });

    it('should return reachable moves excluding the starting position (Standard)', () => {
        const movementRange = 3;
        const currentPos: Position = { x: 0, y: 0 };

        // On part d'un match issu de MOCK_MATCHES en vidant la liste des joueurs
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        match.matchData.players = [];
        const moves = service.getPossibleMoves(movementRange, currentPos, match, false);
        expect(moves).not.toContainEqual(currentPos);
        expect(moves.length).toBeGreaterThan(0);
    });

    it('should return accessible tiles excluding water, broken bridges and occupied positions (Debug)', () => {
        // On clone la map issue de MOCK_MATCHES[0].gameData.mapData (taille 15x15)
        const dummyMap: MapData = structuredClone(MOCK_MATCHES[0].gameData.mapData);

        // Pour le test, on redéfinit uniquement une section de la map (les 4 premières lignes)
        const newSection = [
            [TileType.Grass, TileType.Water, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.BrokenBridge, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
            [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
        ];
        for (let row = 0; row < newSection.length; row++) {
            dummyMap.tiles[row] = newSection[row];
        }
        // On part d'un match sans joueurs, basé sur MOCK_MATCHES[0]
        const matchNoPlayers: Match = structuredClone(MOCK_MATCHES[0]);
        matchNoPlayers.gameData.mapData = dummyMap;
        matchNoPlayers.matchData.players = [];
        const debugMoves = service['getPossibleMovesDebug'](matchNoPlayers);
        // On s'assure que les tuiles de type Water et BrokenBridge dans la section modifiée sont exclues
        expect(debugMoves).not.toContainEqual({ x: 0, y: 1 });
        expect(debugMoves).not.toContainEqual({ x: 1, y: 1 });

        // On ajoute une position occupée obtenue à partir de MOCK_MATCHES
        const occupiedPos: Position = { x: 2, y: 2 };
        const matchWithPlayers: Match = structuredClone(MOCK_MATCHES[0]);
        matchWithPlayers.gameData.mapData = dummyMap;
        // On remplace la liste des joueurs par un tableau contenant un unique joueur, dont currentStats.position est occupiedPos
        matchWithPlayers.matchData.players = [
            {
                ...matchWithPlayers.matchData.players[0],
                currentStats: {
                    ...matchWithPlayers.matchData.players[0].currentStats,
                    position: occupiedPos,
                },
            },
        ];
        const debugMovesWithPlayers = service['getPossibleMovesDebug'](matchWithPlayers);
        expect(debugMovesWithPlayers).not.toContainEqual(occupiedPos);
    });

    it('should return a valid shortest path and cost in an unobstructed grid', () => {
        const match: Match = structuredClone(MOCK_MATCHES[0]);
        const start: Position = { x: 0, y: 0 };
        const target: Position = { x: 4, y: 4 };
        const result = service.getShortestPath(start, target, match);
        const cost = target.x + target.y;
        expect(result.moveCost).toEqual(cost);
        expect(result.path[0]).toEqual(start);
        expect(result.path[result.path.length - 1]).toEqual(target);
    });

    // it('should return an infinite moveCost and an empty path if the target is unreachable', () => {
    //     // On part d'une map issue de MOCK_GAMES[2] (taille Small) pour respecter les constantes
    //     const dummyMap: MapData = structuredClone(MOCK_GAMES[2].mapData);
    //     // On modifie la section tiles pour créer une situation bloquée
    //     dummyMap.tiles = [
    //         [TileType.Grass, TileType.Water, TileType.Grass],
    //         [TileType.Water, TileType.Water, TileType.Water],
    //         [TileType.Grass, TileType.Water, TileType.Grass],
    //     ];
    //     const match: Match = structuredClone(MOCK_MATCHES[2]);
    //     match.gameData.mapData = dummyMap;
    //     match.matchData.players = [];
    //     const start: Position = { x: 0, y: 0 };
    //     const target: Position = { x: 2, y: 2 };
    //     const result = service.getShortestPath(start, target, match);
    //     expect(result.moveCost).toEqual(Infinity);
    //     expect(result.path).toEqual([]);
    // });

    // it('should correctly determine if movement is possible (canMove)', () => {
    //     const movementRange = 5;
    //     const currentPos: Position = { x: 0, y: 0 };
    //     const reachableTarget: Position = { x: 1, y: 1 };
    //     const unreachableTarget: Position = { x: 3, y: 3 };
    //     const match: Match = structuredClone(MOCK_MATCHES[0]);
    //     // Pour ce test, on vide la liste des joueurs
    //     match.matchData.players = [];
    //     expect(service.canMove(movementRange, currentPos, reachableTarget, match)).toBe(true);
    //     expect(service.canMove(1, currentPos, unreachableTarget, match)).toBe(false);
    // });
});
