import 'package:client_mobile/models/map_data.dart';

import 'match_data.dart';

class NeighborContext {
  final Position pos;
  final num cost;
  final Position offset;
  final num maxCost;
  final int size;
  final MatchData matchData;
  final List<List<num>> distances;
  final Map<Position, Position> predecessors;
  final List<QueueNode> queue;

  const NeighborContext({
    required this.pos,
    required this.cost,
    required this.offset,
    required this.maxCost,
    required this.size,
    required this.matchData,
    required this.distances,
    required this.predecessors,
    required this.queue,
  });
}

class QueueNode {
  final Position pos;
  final num cost;

  const QueueNode({required this.pos, required this.cost});
}

class DistancesAndPredecessors {
  final List<List<num>> distances;
  final Map<Position, Position> predecessors;

  const DistancesAndPredecessors({required this.distances, required this.predecessors});
}

class VisitedQueue {
  final List<List<bool>> visited;
  final List<Position> queue;

  const VisitedQueue({required this.visited, required this.queue});
}

class ShortestPath {
  final num moveCost;
  final List<Position> path;

  const ShortestPath({required this.moveCost, required this.path});
}
