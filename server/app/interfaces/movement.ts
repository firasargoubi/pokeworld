import { Match } from '@common/match';
import { Position } from '@common/position';

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
