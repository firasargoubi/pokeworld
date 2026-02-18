const SERVER_URL_KEY = 'SERVER_URL';

const Map<String, String> userEndpoints = {
  'UserLogin': 'user/login',
  'UserRegister': 'user/register',
  'UserLogout': 'user/logout',
};

enum GameSaveEndpointKey { getAllGames }

const Map<GameSaveEndpointKey, String> GAME_SAVE_ENDPOINT = {
  GameSaveEndpointKey.getAllGames: '/api/games',
};
