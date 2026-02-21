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
    balance: number;

    @ApiProperty()
    isLoggedIn: boolean;
}
