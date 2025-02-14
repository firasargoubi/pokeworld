export interface PopupMessage {
    message: string;
    isConfirmation: boolean;
    action?: () => void;
}
