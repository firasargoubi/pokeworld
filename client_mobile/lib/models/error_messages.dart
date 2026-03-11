enum ErrorMessage {
  EmptyFields('Veuillez remplir tous les champs'),
  ShortUsername("Le nom d'utilisateur doit comporter au moins 3 caractères"),
  UsernameStartsOrEndsWithSpaces("Le nom d'utilisateur ne doit pas commencer ou se terminer par des espaces"),
  PasswordOnlySpaces('Le mot de passe ne doit pas contenir uniquement des espaces'),
  InvalidEmail('Veuillez entrer une adresse email valide'),
  UsernameExists("Ce nom d'utilisateur existe déjà"),
  InvalidCredentials("Le nom d'utilisateur ou le mot de passe est invalide"),
  UserNotFound("Le nom d'utilisateur n'existe pas"),
  AlreadyConnected('Ce compte est déjà connecté ailleurs'),
  RegistrationFailed("Échec de l'inscription: "),
  LoginFailed('Échec de la connexion: '),
  LogoutFailed('Échec de la déconnexion: '),
  DeleteAccountFailed('Échec de la suppression du compte: '),
  ServerUrlNotDefined('SERVER_URL is not defined');

  final String message;
  const ErrorMessage(this.message);
}
