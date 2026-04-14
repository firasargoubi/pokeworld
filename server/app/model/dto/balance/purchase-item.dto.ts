import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PurchaseItemDto {
    @ApiProperty({ description: 'Purchasable shop item id', example: 'party-ball' })
    @IsString()
    itemId: string;
}
