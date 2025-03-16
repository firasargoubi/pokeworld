export enum TileType {
    Grass = 'Grass',
    Path = 'Path',
    Bush = 'Bush',
    Water = 'Water',
    Bridge = 'Bridge',
    BrokenBridge = 'BrokenBridge',
    None = 'None',
}

export enum TileCost {
    Path = 0,
    Grass = 1,
    Bush = 2,
    Water = Infinity,
    Bridge = 1,
    BrokenBridge = Infinity,
    None = Infinity,
}