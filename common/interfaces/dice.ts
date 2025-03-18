enum DiceType {
    D4 = 'dice-icon-4',
    D6 = 'dice-icon-6',
}

const DICE_MAX_VALUE: { [key in DiceType]: number } = {
    [DiceType.D4]: 4,
    [DiceType.D6]: 6,
};

interface BonusDice {
    attack: DiceType;
    defense: DiceType;
}

export { BonusDice, DICE_MAX_VALUE, DiceType };
