import { FriendRequestDto } from '@app/model/dto/social/friend-request.dto';
import { UserRelationships } from '@app/model/schema/user-relationships.schema';
import { SocialService } from '@app/services/social/social.service';
import { SocialListItem, SocialListTab } from '@common/interfaces/social';

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('social')
@Controller('social')
export class SocialController {
    constructor(private readonly socialService: SocialService) {}

    @Post('friend-request')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Send a friend request' })
    @ApiResponse({ status: 204, description: 'Friend request processed' })
    async sendFriendRequest(@Body() body: FriendRequestDto): Promise<void> {
        return this.socialService.sendFriendRequest(body.userId, body.targetUserId);
    }

    @Post('friend-request/accept')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Accept a friend request' })
    @ApiResponse({ status: 204, description: 'Friend request accepted' })
    async acceptFriendRequest(@Body() body: FriendRequestDto): Promise<void> {
        return this.socialService.acceptFriendRequest(body.userId, body.targetUserId);
    }

    @Post('friend-request/reject')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Reject a friend request' })
    @ApiResponse({ status: 204, description: 'Friend request rejected' })
    async rejectFriendRequest(@Body() body: FriendRequestDto): Promise<void> {
        return this.socialService.rejectFriendRequest(body.userId, body.targetUserId);
    }

    @Post('friend/remove')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove a friend' })
    @ApiResponse({ status: 204, description: 'Friend removed' })
    async removeFriend(@Body() body: FriendRequestDto): Promise<void> {
        return this.socialService.removeFriend(body.userId, body.targetUserId);
    }

    @Post('block')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Block a user' })
    @ApiResponse({ status: 204, description: 'User blocked' })
    async blockUser(@Body() body: FriendRequestDto): Promise<void> {
        return this.socialService.blockUser(body.userId, body.targetUserId);
    }

    @Post('unblock')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Unblock a user' })
    @ApiResponse({ status: 204, description: 'User unblocked' })
    async unblockUser(@Body() body: FriendRequestDto): Promise<void> {
        return this.socialService.unblockUser(body.userId, body.targetUserId);
    }

    @Get('list/:userId')
    @ApiOperation({ summary: 'Get display-ready social list for a user' })
    @ApiQuery({ name: 'tab', required: false, enum: SocialListTab })
    @ApiQuery({ name: 'q', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Display list returned' })
    async getRelationshipList(
        @Param('userId') userId: string,
        @Query('tab') tab: SocialListTab = SocialListTab.Search,
        @Query('q') query: string = '',
    ): Promise<SocialListItem[]> {
        return this.socialService.getRelationshipList(userId, tab, query);
    }

    @Get('relationships/:userId')
    @ApiOperation({ summary: 'Get social relationships for a user' })
    @ApiResponse({ status: 200, description: 'Relationships returned' })
    async getRelationships(@Param('userId') userId: string): Promise<UserRelationships> {
        return this.socialService.getRelationships(userId);
    }
}
