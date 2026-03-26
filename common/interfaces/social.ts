import { UserInfo } from './user';

export enum SocialListTab {
    Search = 'search',
    Friends = 'friends',
    ReceivedRequests = 'received_requests',
    Blocked = 'blocked',
}

export enum RelationshipType {
    None = 'none',
    PendingSent = 'pending_sent',
    PendingReceived = 'pending_received',
    Friend = 'friend',
    Blocked = 'blocked',
}

export interface SocialListUser {
    userId: UserInfo['userId'];
    username: UserInfo['username'];
    profilePicture: UserInfo['profilePicture'];
    fullProfilePicture: UserInfo['fullProfilePicture'];
}

export interface SocialListItem {
    user: SocialListUser;
    relation: RelationshipType;
}
