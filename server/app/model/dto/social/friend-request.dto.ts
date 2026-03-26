import { ApiProperty } from '@nestjs/swagger';

export class FriendRequestDto {
    @ApiProperty({ description: 'User ID of the requester', example: 'uuid-1234' })
    userId: string;

    @ApiProperty({ description: 'Target user ID', example: 'uuid-5678' })
    targetUserId: string;
}
