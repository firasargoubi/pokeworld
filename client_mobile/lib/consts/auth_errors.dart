enum AuthError { invalidCredentials, userNotFound, alreadyConnected, usernameExists }

class AuthException implements Exception {
  final AuthError error;
  AuthException(this.error);
}
