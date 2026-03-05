enum PopupMessageConst {
  deleteGame('Êtes-vous sûr de vouloir supprimer le jeu :'),
  quit('Voulez-vous vraiment quitter ?'),
  quitEditPage('Voulez-vous vraiment quitter la page? Les modifications non sauvegardées seront perdues.'),
  successfulSave('Jeu sauvegardé avec succès'),
  cancelModification('Voulez-vous vraiment annuler les modifications?'),
  gameDoesNotExist("Le jeu n'existe pas !"),
  errorFetchingGame('Erreur lors de la récupération du jeu !'),
  errorLoadingGames('Erreur lors du chargement des jeux !'),
  surrender('Voulez-vous vraiment abandonner ?'),
  connectionError('Erreur de connection avec le serveur'),
  nameAlreadyExists('Le nom est déjà utilisé. Veuillez en choisir un autre.'),
  successfulConnection('Connecté avec succès !'),
  successfulAccountCreation('Compte créé avec succès !'),
  logoutConfirmation('Êtes-vous sûr de vouloir vous déconnecter ?'),
  emptyFields('Veuillez remplir tous les champs'),
  usernameSpaces('Le nom d’utilisateur ne doit pas commencer ni finir par des espaces'),
  usernameLength('Le nom doit contenir entre 3 et 15 caractères'),
  invalidCredentials("Le nom d'utilisateur ou le mot de passe est invalide"),
  usernameTaken("Le nom d'utilisateur est déjà utilisé"),
  accountConnected('Le compte est déjà connecté sur une autre plateforme'),
  changeConfirmed('Le mot de passe a été changé !');

  const PopupMessageConst(this.message);

  final String message;
}

const List<String> keywordsToReplace = <String>['debug'];

const int popupDelayInSeconds = 3;
