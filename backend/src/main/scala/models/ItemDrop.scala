package io.dmtri.minecraft
package models

import io.circe.generic.semiauto.deriveEncoder
import io.circe.{Encoder, Json}

trait ItemDrop {
  def id: Int
  def itemId: Int
  def amount: Int
  def probability: Int
  def metadata: Option[String]
}

case class BiomeItemDrop(
    id: Int,
    itemId: Int,
    amount: Int,
    probability: Int,
    metadata: Option[String],
    biomeId: Int
) extends ItemDrop

case class GiftItemDrop(
    id: Int,
    itemId: Int,
    amount: Int,
    probability: Int,
    metadata: Option[String],
    giftSource: String
) extends ItemDrop

case class FishingItemDrop(
    id: Int,
    itemId: Int,
    amount: Int,
    probability: Int,
    metadata: Option[String]
) extends ItemDrop

case class MobItemDrop(
    id: Int,
    itemId: Int,
    amount: Int,
    probability: Int,
    metadata: Option[String],
    mobId: Int
) extends ItemDrop

case class ChestItemDrop(
    id: Int,
    itemId: Int,
    amount: Int,
    probability: Int,
    metadata: Option[String],
    structureId: Int
) extends ItemDrop

case class ItemDrops(
    biomeDrops: Seq[BiomeItemDrop],
    giftDrops: Seq[GiftItemDrop],
    fishingDrops: Seq[FishingItemDrop],
    mobDrops: Seq[MobItemDrop],
    chestDrops: Seq[ChestItemDrop]
)

object ItemDrops {
  implicit val biomeDropsEncoder: Encoder[BiomeItemDrop] = deriveEncoder
  implicit val giftDropsEncoder: Encoder[GiftItemDrop] = deriveEncoder
  implicit val fishingDropsEncoder: Encoder[FishingItemDrop] = deriveEncoder
  implicit val mobDropsEncoder: Encoder[MobItemDrop] = deriveEncoder
  implicit val chestDropsEncoder: Encoder[ChestItemDrop] = deriveEncoder
  implicit val encoder: Encoder[ItemDrops] = deriveEncoder
}