export enum ErrorCode {
    Empty = 'Field cannot be empty',
    TooLong = 'Value exceeds the maximum allowed length',
    BridgeAtEdge = 'Bridge cannot be placed at the edge of the map',
    BridgeNotBetweenWalls = 'Bridge must be placed between two water tiles',
    MissingRequiredItems = 'Not enough required items placed on the map',
    TooManyItems = 'Too many items of this type placed on the map',
}
