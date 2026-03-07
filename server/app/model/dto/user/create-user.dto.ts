import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

class UserPreferencesDto {
    @ApiProperty({ description: 'Visual theme', enum: AppTheme, example: AppTheme.Default })
    @IsEnum(AppTheme)
    theme: AppTheme;

    @ApiProperty({ description: 'Application language', enum: AppLanguage, example: AppLanguage.French })
    @IsEnum(AppLanguage)
    language: AppLanguage;
}

export class CreateUserDto extends PartialType(LoginUserDto) {
    @ApiProperty({ description: 'Email', example: 'john.doe@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Profile picture', example: 'Avatar_1' })
    @IsString()
    profilePicture: string;

    @ApiProperty({ description: 'User preferences', required: false, type: UserPreferencesDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UserPreferencesDto)
    preferences?: UserPreferencesDto;
}
