class PopupMessage {
  const PopupMessage({
    required this.message,
    this.hasCloseButton = false,
    this.isConfirmation = false,
    this.popupColor = PopupColor.Orange,
    this.action,
  });

  final String message;
  final bool hasCloseButton;
  final bool isConfirmation;
  final PopupColor popupColor;
  final void Function()? action;
}

enum PopupColor { Orange, Blue, Green }

enum PopupMessages {
  DeleteGame('popup.deleteGame'),
  Quit('popup.quit'),
  QuitEditPage('popup.quitEditPage'),
  SuccessfulSave('popup.successfulSave'),
  CancelModification('popup.cancelModification'),
  GameDoesNotExist('popup.gameDoesNotExist'),
  ErrorFetchingGame('popup.errorFetchingGame'),
  ErrorLoadingGames('popup.errorLoadingGames'),
  Surrender('popup.surrender'),
  ConnectionError('popup.connectionError'),
  NameAlreadyExists('popup.nameAlreadyExists'),
  SuccessfulConnection('popup.successfulConnection'),
  SuccessfulAccountCreation('popup.successfulAccountCreation'),
  LogoutConfirmation('popup.logoutConfirmation'),
  EmptyFields('popup.emptyFields'),
  UsernameSpaces('popup.usernameSpaces'),
  UsernameLength('popup.usernameLength'),
  InvalidCredentials('popup.invalidCredentials'),
  UsernameTaken('popup.usernameTaken'),
  AccountConnected('popup.accountConnected'),
  ChangeConfirmed('popup.changeConfirmed'),
  ConfirmAccountCreation('components.authPopup.confirmAccountCreation'),
  ResetTutorialConfirmation('components.tutorial.resetTutorialConfirmation');

  const PopupMessages(this.messageKey);

  final String messageKey;
}
