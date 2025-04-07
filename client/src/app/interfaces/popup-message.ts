export interface PopupMessage {
    message: string;
    hasCloseButton: boolean;
    isConfirmation: boolean;
    action?: () => void;
}
