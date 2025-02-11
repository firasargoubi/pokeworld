enum DiceType {
    D6 = '⚅',
    D4 = '⚃',
}

enum BonusDice {
    Option1 = '0',
    Option2 = '1',
}

const DICE_PAIR = [
    { attack: DiceType.D4, defense: DiceType.D6 },
    { attack: DiceType.D6, defense: DiceType.D4 },
];

export { DiceType, DICE_PAIR, BonusDice };
