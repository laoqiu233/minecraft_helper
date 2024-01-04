package io.dmtri.minecraft
package handlers

import io.circe.Decoder
import io.circe.parser.decode
import io.dmtri.minecraft.models.ApiError
import io.dmtri.minecraft.models.ApiError.encodeErrorResponse
import zio.ZIO
import zio.http.{HandlerAspect, Request, handler}

object ParseBodyAspect {
  def parseJson[T](implicit decoder: Decoder[T]): HandlerAspect[Any, T] =
    HandlerAspect.interceptIncomingHandler(
      handler { (req: Request) =>
        for {
          body <- req.body.asString
          decodedRequest <- ZIO.fromEither(decode[T](body))
        } yield (req, decodedRequest)
      }.mapError(err =>
        encodeErrorResponse(
          ApiError.InvalidRequestError(s"Invalid body: ${err.toString}")
        )
      )
    )
}
