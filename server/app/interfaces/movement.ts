import { MatchData } from '@common/interfaces/match-data';
import { Position } from '@common/interfaces/position';

export interface NeighborContext {
    pos: Position;
    cost: number;
    offset: { x: number; y: number };
    maxCost: number;
    size: number;
    match: MatchData;
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

export interface VisitedQueue {
    visited: boolean[][];
    queue: Position[];
}
