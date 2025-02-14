export enum ErrorCode {
    Empty = 'Le champ ne peut pas être vide',
    TooLong = 'La valeur dépasse la longueur maximale autorisée',
    Bridge = 'Problème de pont en',
    BridgeAtEdge = 'Le pont ne peut pas être placé au bord de la carte',
    BridgeNotBetweenWalls = "Le pont doit être placé entre deux tuiles d'eau",
    MissingRequiredItems = "Pas assez d'éléments requis placés sur la carte",
    TooManyItems = "Trop d'éléments de ce type placés sur la carte",
    DuplicatedName = 'Le nom du jeu existe déjà',
    TerrainCoverage = 'Couverture du terrain insuffisante',
    TilesAccessibility = 'Tuiles inaccessibles',
    Items = 'Objets mal placés',
}
