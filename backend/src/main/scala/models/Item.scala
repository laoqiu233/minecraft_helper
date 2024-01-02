package io.dmtri.minecraft
package models

import io.circe.Encoder
import io.circe.generic.semiauto.deriveEncoder

case class Item(id: Int, name: String, image: String)

object Item {
  implicit val encoder: Encoder[Item] = deriveEncoder
}
