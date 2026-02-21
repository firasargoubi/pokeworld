import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EditUserDto {
    @ApiProperty()
    userId: string;

    @ApiProperty({ description: 'Password', example: 'SecurePass123!' })
    @IsString()
    password: string;

    @ApiProperty({ description: 'Password', example: 'SecurePass123!' })
    @IsString()
    oldPassword: string;
}
