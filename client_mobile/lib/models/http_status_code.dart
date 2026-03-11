enum HttpStatusCode {
  Ok(200),
  Created(201),
  NoContent(204),
  Unauthorized(401),
  NotFound(404),
  Conflict(409),
  InternalServerError(500);

  const HttpStatusCode(this.code);

  final int code;
}
