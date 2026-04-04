import { AppLanguage, AppTheme } from '../interfaces/preferences';
import { UserInfo } from '../interfaces/user';

export const MOCK_USER_INFO: UserInfo[] = [
    {
        userId: 'user-1',
        username: 'TestUser',
        profilePicture: 'profile.jpg',
        fullProfilePicture: 'full-profile.jpg',
        balance: 100,
        createdAt: new Date(),
        preferences: { language: AppLanguage.English, theme: AppTheme.Dark },
        inventory: [],
        email: '',
    },
    {
        userId: 'user-2',
        username: 'TestUser2',
        profilePicture: 'profile2.jpg',
        fullProfilePicture: 'full-profile2.jpg',
        balance: 150,
        createdAt: new Date(),
        preferences: { language: AppLanguage.French, theme: AppTheme.Default },
        inventory: [],
        email: '',
    },
];
