import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AppLanguage, AppTheme, MenuMusicVariant, PartyBallVariant } from '@common/interfaces/preferences';

export class UpdatePreferencesDto {
    @ApiProperty({ description: 'Visual theme', enum: AppTheme, example: AppTheme.Default })
    @IsOptional()
    @IsEnum(AppTheme)
    theme?: AppTheme;

    @ApiProperty({ description: 'Application language', enum: AppLanguage, example: AppLanguage.French })
    @IsOptional()
    @IsEnum(AppLanguage)
    language?: AppLanguage;

    @ApiProperty({ description: 'Selected party ball variant', enum: PartyBallVariant, example: PartyBallVariant.Zero })
    @IsOptional()
    @IsEnum(PartyBallVariant)
    partyBall?: PartyBallVariant;

    @ApiProperty({ description: 'Selected menu music variant', enum: MenuMusicVariant, example: MenuMusicVariant.Zero })
    @IsOptional()
    @IsEnum(MenuMusicVariant)
    menuMusic?: MenuMusicVariant;
}
