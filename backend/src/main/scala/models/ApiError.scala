package io.dmtri.minecraft
package models
import zio.http.{Response, Status}
import io.circe.generic.semiauto._
import io.circe._
import io.circe.syntax._


sealed abstract class ApiError(val errorType: String, val msg: String)

object ApiError {
  implicit val errorEncoder: Encoder[ApiError] = Encoder.forProduct2("type", "msg"){ error =>
    (error.errorType, error.msg)
  }

  final case class InvalidRequestError(cause: String) extends ApiError("invalid_request", cause)
  final case class InternalError(cause: Throwable) extends ApiError("internal", cause.toString)
  final case class NotFoundError(cause: String) extends ApiError("not_found", cause)

  def encodeErrorResponse(error: ApiError): Response =
    Response.json(error.asJson.toString).status(error match {
      case _: InternalError => Status.InternalServerError
      case _: NotFoundError => Status.NotFound
      case _: InvalidRequestError => Status.BadRequest
    })
}
