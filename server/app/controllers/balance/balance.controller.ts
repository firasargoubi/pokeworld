import { PurchaseItemDto } from '@app/model/dto/balance/purchase-item.dto';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { BalanceService } from '@app/services/balance/balance.service';
import { ShopItem } from '@common/interfaces/shop';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('balance')
@Controller('balance')
export class BalanceController {
    constructor(private readonly balanceService: BalanceService) {}

    @Get('items')
    @ApiOperation({ summary: 'Get all purchasable shop items' })
    @ApiResponse({ status: 200, description: 'Returns all shop items' })
    getShopItems(): ShopItem[] {
        return this.balanceService.getShopItems();
    }

    @Post(':userId/purchase')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Purchase a shop item for a user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Purchase completed', type: UserResponseDto })
    @ApiBadRequestResponse({ description: 'Insufficient balance' })
    @ApiNotFoundResponse({ description: 'User not found' })
    async purchaseItem(@Param('userId') userId: string, @Body() dto: PurchaseItemDto): Promise<UserResponseDto> {
        return this.balanceService.purchaseItem(userId, dto.itemId);
    }
}
