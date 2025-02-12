enum DiceType {
    D4 = 'dice-icon-4',
    D6 = 'dice-icon-6',
}

interface BonusDice {
    attack: DiceType;
    defense: DiceType;
}

export { DiceType, BonusDice };
