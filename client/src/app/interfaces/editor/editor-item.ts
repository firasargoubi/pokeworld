import { ItemType } from '@common/item-type.enum';

export interface EditorItem {
    item: ItemType;
    image: string;
    count: number;
}
