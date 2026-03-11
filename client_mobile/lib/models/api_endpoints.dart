enum UserEndpoint {
  UserLogin('user/login'),
  UserRegister('user/register'),
  UserLogout('user/logout'),
  UserEdit('user/edit'),
  UserDelete('user');

  final String path;
  const UserEndpoint(this.path);
}

enum GameEndpoint {
  GetAllGames('/api/games');

  final String path;
  const GameEndpoint(this.path);
}
