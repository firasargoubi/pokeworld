import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
    @ApiProperty()
    userId: string;

    @ApiPropertyOptional({ description: 'New username', example: 'Trainer_001' })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiPropertyOptional({ description: 'New password', example: 'SecurePass123!' })
    @IsString()
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ description: 'Old password', example: 'SecurePass123!' })
    @IsString()
    @IsOptional()
    oldPassword?: string;

    @ApiPropertyOptional({ description: 'New tutorial step', example: 5 })
    @IsNumber()
    @IsOptional()
    tutorialStep?: number;
}
