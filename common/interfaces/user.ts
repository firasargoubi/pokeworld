import { UserPreferences } from './preferences';
import { InventoryItem } from './shop';

export interface UserInfo {
    userId: string;
    username: string;
    email: string;
    profilePicture: string;
    fullProfilePicture: string;
    balance: number;
    inventory: InventoryItem[];
    createdAt: Date;
    preferences: UserPreferences;
}
