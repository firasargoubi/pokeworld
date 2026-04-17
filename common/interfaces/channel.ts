import { ChatMessage } from './chat-message';

export interface Channel {
    name: string;
    membersUsernames: string[];
}

export interface ChannelMessage {
    channelName: string;
    message: ChatMessage;
}

export interface ChannelUser {
    userId?: string;
    channelName: string;
    isDedicatedChannel?: boolean;
}
