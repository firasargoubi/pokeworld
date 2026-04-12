import { UserChallengeData } from '@common/interfaces/challenge-data';
import { UserPreferences } from '@common/interfaces/preferences';
import { InventoryItem } from '@common/interfaces/shop';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    profilePicture: string;

    @ApiProperty()
    fullProfilePicture: string;

    @ApiProperty()
    balance: number;

    @ApiProperty()
    inventory: InventoryItem[];

    @ApiProperty()
    challenges: UserChallengeData[];

    @ApiProperty()
    isLoggedIn: boolean;

    @ApiProperty()
    preferences: UserPreferences;

    @ApiProperty()
    tutorialStep: number;
}
