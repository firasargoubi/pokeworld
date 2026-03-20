export interface UserInfo {
    username: string;
    userId: string;
}

export enum UserCardType {
    Front = 'front',
    Settings = 'settings',
    Friends = 'friends',
    Inventory = 'inventory',
}
