enum AuthError { invalidCredentials, userNotFound, alreadyConnected, usernameExists, wrongPassword }

class AuthException implements Exception {
  final AuthError error;
  AuthException(this.error);
}
