class ErrorMessages {
  // Validation errors
  static const String emptyFields = 'Veuillez remplir tous les champs';
  static const String shortUsername =
      'Le nom d\'utilisateur doit comporter au moins 3 caractères';
  static const String usernameStartsOrEndsWithSpaces =
    "Le nom d'utilisateur ne doit pas commencer ou se terminer par des espaces";
  static const String passwordOnlySpaces =
    'Le mot de passe ne doit pas contenir uniquement des espaces';

  // Authentication errors
  static const String usernameExists = "Ce nom d'utilisateur existe déjà";
  static const String invalidCredentials = 'Le nom d\'utilisateur ou le mot de passe est invalide';
  static const String userNotFound = "Le nom d'utilisateur n'existe pas";
  static const String alreadyConnected = 'Ce compte est déjà connecté ailleurs';

  // Generic errors
  static const String registrationFailed = "Échec de l'inscription: ";
  static const String loginFailed = 'Échec de la connexion: ';

  // Server errors
  static const String serverUrlNotDefined = 'SERVER_URL is not defined';
}
