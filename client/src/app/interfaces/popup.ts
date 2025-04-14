export interface Popup {
    message: string;
    hasCloseButton: boolean;
    isConfirmation: boolean;
    action?: () => void;
}
