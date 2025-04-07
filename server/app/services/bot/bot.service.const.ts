import { BotAction } from '@app/interfaces/bot-action.enum';
import { ItemType } from '@common/interfaces/item-type.enum';
import { PlayerType } from '@common/interfaces/player-data';

export const BOT_TURN_PRIORITIES: Map<PlayerType, BotAction[]> = new Map([
    [
        PlayerType.BotAggressive,
        [BotAction.Attack, BotAction.MovePlayer, BotAction.MoveItem, BotAction.Bridge, BotAction.MoveBridge, BotAction.EndTurn],
    ],
    [
        PlayerType.BotDefensive,
        [BotAction.MoveItem, BotAction.MovePlayer, BotAction.MoveItem, BotAction.Bridge, BotAction.MoveBridge, BotAction.EndTurn],
    ],
]);

export const BOT_ITEM_PRIORITIES: Map<PlayerType, ItemType[]> = new Map([
    [PlayerType.BotAggressive, [ItemType.Item2, ItemType.Item1, ItemType.Item3, ItemType.Item6, ItemType.Item4, ItemType.Item5]],
    [PlayerType.BotDefensive, [ItemType.Item2, ItemType.Item1, ItemType.Item4, ItemType.Item5, ItemType.Item6, ItemType.Item3]],
]);

export const BOT_ID_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
