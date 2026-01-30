import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({ description: 'Username', example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'Password', example: 'SecurePass123!' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
