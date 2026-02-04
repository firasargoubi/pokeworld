enum HttpStatusCode {
  ok(200),
  created(201),
  noContent(204),
  unauthorized(401),
  notFound(404),
  conflict(409),
  internalServerError(500);

  const HttpStatusCode(this.code);

  final int code;
}
