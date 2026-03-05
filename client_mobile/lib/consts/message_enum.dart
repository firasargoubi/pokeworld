enum Message {
  adminQuit("L'administrateur a quitté la partie"),
  kick("Vous avez été exclu par l'administrateur"),
  roomFull("La partie est pleine"),
  alreadyInMatch("Vous êtes déjà dans une partie"),
  invalidMatchCode("La partie n'existe pas"),
  roomLocked("La partie est verrouillée"),
  lockedFromLobby("Le jeu s'est verrouillé pendant que vous choisissiez votre personnage, souhaitez-vous revenir au menu principal ?"),
  lastPlayerRemaining("La partie est terminée car tous les autres joueurs ont quitté"),
  debugModeOn("Le mode de debug a été activé"),
  debugModeOff("Le mode de debug a été désactivé"),
  notEnoughPlayers("La partie doit avoir au moins 2 joueurs pour débuter"),
  notLocked("La partie doit être verouillée pour débuter"),
  notEvenPlayers("Le mode CTF nécessite un nombre pair de joueurs"),
  deleteGame("Le jeu a été supprimé"),
  invisibleGame("Le jeu n'est plus visible");

  const Message(this.message);

  final String message;
}

const List<String> keywordsToReplace = <String>['debug'];

final List<String> warningMessages = <String>[
  Message.adminQuit.message,
  Message.alreadyInMatch.message,
  Message.invalidMatchCode.message,
  Message.kick.message,
  Message.notEnoughPlayers.message,
  Message.roomFull.message,
  Message.notEvenPlayers.message,
  Message.notEnoughPlayers.message,
  Message.lockedFromLobby.message,
  Message.lastPlayerRemaining.message,
  Message.roomLocked.message,
  Message.notLocked.message,
];
