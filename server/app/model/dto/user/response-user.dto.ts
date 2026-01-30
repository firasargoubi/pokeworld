import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    isLoggedIn: boolean;
}
