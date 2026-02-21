import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class CreateUserDto extends PartialType(LoginUserDto) {
    @ApiProperty({ description: 'Email', example: 'john.doe@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Profile picture', example: 'Avatar_1' })
    @IsString()
    profilePicture: string;
}
