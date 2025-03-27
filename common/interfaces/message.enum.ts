export enum Message {
    AdminQuit = "L'administrateur a quitté la partie",
    Kick = "Vous avez été exclu par l'administrateur",
    RoomFull = 'La partie est pleine',
    AlreadyInMatch = 'Vous êtes déjà dans une partie',
    InvalidMatchCode = "La partie n'existe pas",
    RoomLocked = 'La partie est verrouillée',
    LockedFromLobby = "Le jeu s'est verrouillé pendant que vous choisissiez votre personnage",
    LastPlayerRemaining = 'La partie est terminée car tous les autres joueurs ont quitté',
}
