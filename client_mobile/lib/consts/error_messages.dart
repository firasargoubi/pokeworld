class ErrorMessages {
  // Validation errors
  static const String emptyFields = 'Veuillez remplir tous les champs';

  // Authentication errors
  static const String usernameExists = "Ce nom d'utilisateur existe déjà";
  static const String invalidCredentials = 'Mot de passe incorrect';
  static const String userNotFound = "Le nom d'utilisateur n'existe pas";
  static const String alreadyConnected = 'Ce compte est déjà connecté ailleurs';

  // Generic errors
  static const String registrationFailed = "Échec de l'inscription: ";
  static const String loginFailed = 'Échec de la connexion: ';

  // Server errors
  static const String serverUrlNotDefined = 'SERVER_URL is not defined';
}
