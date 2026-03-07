import { ApiProperty } from '@nestjs/swagger';
import { UserPreferences } from '@common/interfaces/preferences';

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
    balance: number;

    @ApiProperty()
    isLoggedIn: boolean;

    @ApiProperty()
    preferences: UserPreferences;
}
