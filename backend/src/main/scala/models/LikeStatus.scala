package io.dmtri.minecraft
package models

import io.circe.{Decoder, Encoder, Json}

sealed trait LikeStatus

object LikeStatus {
  object Like extends LikeStatus

  object Dislike extends LikeStatus

  object NoStatus extends LikeStatus

  implicit val encodeLikeStatus: Encoder[LikeStatus] = Encoder.encodeString.contramap {
    case Like => "like"
    case Dislike => "dislike"
    case NoStatus => "no_status"
  }

  implicit val decodeLikeStatus: Decoder[LikeStatus] = Decoder.decodeString.map {
    case "like" => Like
    case "dislike" => Dislike
    case _ => NoStatus
  }
}
