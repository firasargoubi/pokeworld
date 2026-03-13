enum ErrorMessage {
  EmptyFields('popup.emptyFields'),
  ShortUsername('popup.usernameLength'),
  UsernameStartsOrEndsWithSpaces('popup.usernameSpaces'),
  PasswordOnlySpaces('popup.passwordSpaces'),
  InvalidEmail('popup.invalidEmail'),
  UsernameExists('popup.usernameTaken'),
  InvalidCredentials('popup.invalidCredentials'),
  UserNotFound('popup.userNotFound'),
  AlreadyConnected('popup.accountConnected'),
  RegistrationFailed('popup.registrationFailed'),
  LoginFailed('popup.loginFailed'),
  LogoutFailed('popup.logoutFailed'),
  DeleteAccountFailed('popup.deleteAccountFailed'),
  ChangeFailed('popup.changeFailed'),
  ServerUrlNotDefined('SERVER_URL is not defined');

  final String message;
  const ErrorMessage(this.message);
}
