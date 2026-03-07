import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AppLanguage, AppTheme } from '@common/interfaces/preferences';

export class UpdatePreferencesDto {
    @ApiProperty({ description: 'Visual theme', enum: AppTheme, example: AppTheme.Default })
    @IsOptional()
    @IsEnum(AppTheme)
    theme?: AppTheme;

    @ApiProperty({ description: 'Application language', enum: AppLanguage, example: AppLanguage.French })
    @IsOptional()
    @IsEnum(AppLanguage)
    language?: AppLanguage;
}
