package io.dmtri.minecraft
package models

import zio.json.{DeriveJsonEncoder, JsonEncoder}

case class Item (id: Int, name: String, image: String)

object Item {
  implicit val encoder: JsonEncoder[Item] = DeriveJsonEncoder.gen[Item]
}
