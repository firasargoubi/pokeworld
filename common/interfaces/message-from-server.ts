export interface MessageFromServer {
    message: string;
    hasCloseButton: boolean;
    messageParams?: Record<string, string | number | boolean>;
}
