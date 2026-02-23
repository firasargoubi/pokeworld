import { ChatTab } from './chat-tab.enum';

export interface ChatState {
    activeTab: ChatTab;
    isInChannelList?: boolean;
    activeChannelName?: string;
}
