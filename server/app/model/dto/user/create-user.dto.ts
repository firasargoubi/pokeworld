import { AppLanguage, AppTheme, PartyBallVariant } from '@common/interfaces/preferences';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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

    @ApiProperty({ description: 'Selected party ball variant', enum: PartyBallVariant, example: PartyBallVariant.Zero, required: false })
    @IsOptional()
    @IsEnum(PartyBallVariant)
    partyBall?: PartyBallVariant;
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

    @ApiPropertyOptional({ description: 'Full profile picture', example: 'Avatar_full_1' })
    @IsString()
    @IsOptional()
    fullProfilePicture?: string;
}
