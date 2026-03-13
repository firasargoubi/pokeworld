import { UserPreferences } from './preferences';

export interface UserInfo {
    userId: string;
    username: string;
    email: string;
    profilePicture: string;
    fullProfilePicture: string;
    balance: number;
    createdAt: Date;
    preferences: UserPreferences;
}
