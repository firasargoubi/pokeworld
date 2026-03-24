import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PurchaseItemDto {
    @ApiProperty({ description: 'Purchasable shop item id', example: 'shop-item-1' })
    @IsString()
    itemId: string;
}
