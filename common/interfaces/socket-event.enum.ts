export enum MatchEvent {
    CreateMatch = 'createMatch',
    JoinMatch = 'joinMatch',
    LeaveMatch = 'leaveMatch',

    Update = 'update',
    Message = 'message',
    Popup = 'popup',
    RemovedFromMatch = 'removedFromMatch',
    Disconnect = 'disconnect',
}

export enum LobbyEvent {
    KickPlayer = 'kickPlayer',
    ChangeAvatar = 'changeAvatar',
    JoinLobby = 'joinLobby',
    ChangeLockStatus = 'changeLockStatus',
    StartMatch = 'startMatch',
    AddBot = 'addBot',
    ChangeMatchSettings = 'changeMatchSettings',
}

export enum PlayEvent {
    EndTurn = 'endTurn',
    Move = 'move',
    Action = 'action',
    DebugMove = 'debugMove',
    ChangeDebugMode = 'changeDebugMode',
    DropItem = 'dropItem',
}

export enum CombatEvent {
    Attack = 'attack',
    Escape = 'escape',
}

export enum ChatEvent {
    Message = 'message',
    GeneralMessage = 'generalMessage',
    CreateChannel = 'createChannel',
    JoinChannel = 'joinChannel',
    LeaveChannel = 'leaveChannel',
    DeleteChannel = 'deleteChannel',
    ChannelMessage = 'channelMessage',
    ChannelUpdate = 'channelUpdate',
}

export enum UserEvent {
    Associate = 'associate',
}

export enum JoinPageEvent {
    JoinRoom = 'joinJoinPageRoom',
    LeaveRoom = 'leaveJoinPageRoom',
    UpdateMatchList = 'updateMatchList',
    Room = 'joinPageRoom',
}

