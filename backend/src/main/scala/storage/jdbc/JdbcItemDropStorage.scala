package io.dmtri.minecraft
package storage.jdbc

import storage.ItemDropStorage

import io.dmtri.minecraft.models.{
  BiomeItemDrop,
  ChestItemDrop,
  FishingItemDrop,
  GiftItemDrop,
  ItemDrop,
  MobItemDrop
}
import zio.{Task, ZIO, ZLayer}
import zio.jdbc.{JdbcDecoder, ZConnectionPool, stringToSql, transaction}

trait JdbcItemDropStorage[T <: ItemDrop]
    extends ItemDropStorage[T]
    with JdbcStorage {
  def tableName: String
  protected implicit val decoder: JdbcDecoder[T]

  override def getDrops: Task[Seq[T]] = transaction {
    val query = s"SELECT * FROM $tableName"
    stringToSql(query).query[T].selectAll
  }.provideLayer(poolLayer)

  override def getDropsForItem(itemId: Int): Task[Seq[T]] =
    transaction {
      val query = s"SELECT * FROM $tableName WHERE item_id = $itemId"
      stringToSql(query).query[T].selectAll
    }.provideLayer(poolLayer)
}

case class JdbcChestItemDropStorage(pool: ZConnectionPool, tableName: String)
    extends JdbcItemDropStorage[ChestItemDrop] {
  override protected implicit val decoder: JdbcDecoder[ChestItemDrop] =
    JdbcDecoder[(Int, Int, Int, Int, Option[String], Int)]
      .map(ChestItemDrop.tupled)
}
case class JdbcFishingItemDropStorage(pool: ZConnectionPool, tableName: String)
    extends JdbcItemDropStorage[FishingItemDrop] {
  override protected implicit val decoder: JdbcDecoder[FishingItemDrop] =
    JdbcDecoder[(Int, Int, Int, Int, Option[String])]
      .map(FishingItemDrop.tupled)
}
case class JdbcMobItemDropStorage(pool: ZConnectionPool, tableName: String)
    extends JdbcItemDropStorage[MobItemDrop] {
  override protected implicit val decoder: JdbcDecoder[MobItemDrop] =
    JdbcDecoder[(Int, Int, Int, Int, Option[String], Int)]
      .map(MobItemDrop.tupled)
}
case class JdbcBiomeItemDropStorage(pool: ZConnectionPool, tableName: String)
    extends JdbcItemDropStorage[BiomeItemDrop] {
  override protected implicit val decoder: JdbcDecoder[BiomeItemDrop] =
    JdbcDecoder[(Int, Int, Int, Int, Option[String], Int)]
      .map(BiomeItemDrop.tupled)
}
case class JdbcGiftItemDropStorage(pool: ZConnectionPool, tableName: String)
    extends JdbcItemDropStorage[GiftItemDrop] {
  override protected implicit val decoder: JdbcDecoder[GiftItemDrop] =
    JdbcDecoder[(Int, Int, Int, Int, Option[String], String)]
      .map(GiftItemDrop.tupled)
}

object JdbcItemDropStorage {
  val chestItemDropLive
      : ZLayer[ZConnectionPool, Nothing, JdbcChestItemDropStorage] =
    ZLayer.fromZIO(for {
      pool <- ZIO.service[ZConnectionPool]
    } yield JdbcChestItemDropStorage(pool, "chest_drop_table"))

  val fishingItemDropLive = ZLayer.fromZIO(for {
    pool <- ZIO.service[ZConnectionPool]
  } yield JdbcFishingItemDropStorage(pool, "fishing_drop_table"))

  val mobItemDropLive = ZLayer.fromZIO(for {
    pool <- ZIO.service[ZConnectionPool]
  } yield JdbcMobItemDropStorage(pool, "mob_drop_table"))

  val biomeItemDropLive = ZLayer.fromZIO(for {
    pool <- ZIO.service[ZConnectionPool]
  } yield JdbcBiomeItemDropStorage(pool, "biome_drop_taBLE"))

  val giftItemDropLive = ZLayer.fromZIO(for {
    pool <- ZIO.service[ZConnectionPool]
  } yield JdbcGiftItemDropStorage(pool, "gift_drop_table"))
}
