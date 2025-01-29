import { ItemType } from './item-type.enum';
import { Position } from './position';

export interface ItemData {
    [ItemType.Item1]: Position[];
    [ItemType.Item2]: Position[];
    [ItemType.Item3]: Position[];
    [ItemType.Item4]: Position[];
    [ItemType.Item5]: Position[];
    [ItemType.Item6]: Position[];
    [ItemType.Random]: Position[];
    [ItemType.SpawnPoint]: Position[];
    [ItemType.Flag]: Position[];
}
