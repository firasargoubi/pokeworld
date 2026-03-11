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

enum PopupColor { Orange, Blue }

enum PopupMessages {
  DeleteGame('Êtes-vous sûr de vouloir supprimer le jeu :'),
  Quit('Voulez-vous vraiment quitter ?'),
  QuitEditPage('Voulez-vous vraiment quitter la page? Les modifications non sauvegardées seront perdues.'),
  SuccessfulSave('Jeu sauvegardé avec succès'),
  CancelModification('Voulez-vous vraiment annuler les modifications?'),
  GameDoesNotExist("Le jeu n'existe pas !"),
  ErrorFetchingGame('Erreur lors de la récupération du jeu !'),
  ErrorLoadingGames('Erreur lors du chargement des jeux !'),
  Surrender('Voulez-vous vraiment abandonner ?'),
  ConnectionError('Erreur de connection avec le serveur'),
  NameAlreadyExists('Le nom est déjà utilisé. Veuillez en choisir un autre.'),
  SuccessfulConnection('Connecté avec succès !'),
  SuccessfulAccountCreation('Compte créé avec succès !'),
  LogoutConfirmation('Êtes-vous sûr de vouloir vous déconnecter ?'),
  EmptyFields('Veuillez remplir tous les champs'),
  UsernameSpaces('Le nom d’utilisateur ne doit pas commencer ni finir par des espaces'),
  UsernameLength('Le nom doit contenir entre 3 et 15 caractères'),
  InvalidCredentials("Le nom d'utilisateur ou le mot de passe est invalide"),
  UsernameTaken("Le nom d'utilisateur est déjà utilisé"),
  AccountConnected('Le compte est déjà connecté sur une autre plateforme'),
  ChangeConfirmed('Le mot de passe a été changé !');

  const PopupMessages(this.message);

  final String message;
}
