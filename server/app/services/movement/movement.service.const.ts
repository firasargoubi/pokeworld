import { Match } from '@common/match';
import { Position } from '@common/position';
import { TileType } from '@common/tile-type.enum';

export const MOCK_NEW_SECTION: TileType[][] = [
    [TileType.Grass, TileType.Water, TileType.Grass, TileType.Grass],
    [TileType.Grass, TileType.BrokenBridge, TileType.Grass, TileType.Grass],
    [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
    [TileType.Grass, TileType.Grass, TileType.Grass, TileType.Grass],
];

export const MOCK_BLOCKED_MAP_TILES: TileType[][] = [
    [TileType.Grass, TileType.Water, TileType.Grass],
    [TileType.Water, TileType.Water, TileType.Water],
    [TileType.Grass, TileType.Water, TileType.Grass],
];

export const NEIGHBOR_OFFSETS = [
    { x: -1, y: 0 }, // Gauche
    { x: 1, y: 0 }, // Droite
    { x: 0, y: -1 }, // Haut
    { x: 0, y: 1 }, // Bas
];

export interface NeighborContext {
    pos: Position;
    cost: number;
    offset: { x: number; y: number };
    maxCost: number;
    size: number;
    match: Match;
    distances: number[][];
    predecessors: Map<Position, Position>;
    queue: { pos: Position; cost: number }[];
}

export interface QueueNode {
    pos: Position;
    cost: number;
}

export interface DistancesAndPredecessors {
    distances: number[][];
    predecessors: Map<Position, Position>;
}
