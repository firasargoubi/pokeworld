enum Dice {
    D6 = '⚅',
    D4 = '⚃',
}

enum DiceOption {
    Option1,
    Option2,
}

export interface BonusDice {
    attack: Dice;
    defense: Dice;
}

const DICE_PAIR: BonusDice[] = [
    { attack: Dice.D4, defense: Dice.D6 },
    { attack: Dice.D6, defense: Dice.D4 },
];

export { Dice, DICE_PAIR, DiceOption };
