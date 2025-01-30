import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { getImagePath, MetaData } from './meta-data';

type Item = MetaData;
type ItemList = {
    [key in ItemType]: Item;
};

const itemImagesPrefix = 'assets/images/game/items';

const itemIndex: ItemList = {
    [ItemType.Item1]: { description: 'Item 1', image: getImagePath(itemImagesPrefix, 'item1') },
    [ItemType.Item2]: { description: 'Item 2', image: getImagePath(itemImagesPrefix, 'item2') },
    [ItemType.Item3]: { description: 'Item 3', image: getImagePath(itemImagesPrefix, 'item3') },
    [ItemType.Item4]: { description: 'Item 4', image: getImagePath(itemImagesPrefix, 'item4') },
    [ItemType.Item5]: { description: 'Item 5', image: getImagePath(itemImagesPrefix, 'item5') },
    [ItemType.Item6]: { description: 'Item 6', image: getImagePath(itemImagesPrefix, 'item6') },
    [ItemType.Random]: { description: 'Item Aleatoire', image: getImagePath(itemImagesPrefix, 'random') },
    [ItemType.Spawn]: { description: 'Point de Depart', image: getImagePath(itemImagesPrefix, 'spawn') },
    [ItemType.Flag]: { description: 'Drapeau', image: getImagePath(itemImagesPrefix, 'flag') },
};

const multiItemCount = { [MapSize.Small]: 2, [MapSize.Medium]: 4, [MapSize.Large]: 6 };
export { itemIndex, multiItemCount };
