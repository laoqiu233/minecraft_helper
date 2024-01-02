package io.dmtri.minecraft
package storage.jdbc

import storage.ItemsStorage

import io.dmtri.minecraft.models.Item
import zio.{Task, ZIO, ZLayer}
import zio.jdbc.{JdbcDecoder, JdbcEncoder, ZConnectionPool, sqlInterpolator, transaction}
import zio.schema.{Schema, TypeId}
import zio.schema.Schema.Field

case class JdbcItemsStorage(pool: ZConnectionPool) extends ItemsStorage with JdbcStorage[Item] {
  import JdbcItemsStorage._

  override def getAllItems: Task[Seq[Item]] = selectAllQuery.map(_.toSeq)
    .provideLayer(poolLayer)

  override def getItemById(id: Int): Task[Option[Item]] = selectItemByIdQuery(id)
    .provideLayer(poolLayer)

  override def getItemsByTagId(tagId: Integer): Task[Seq[Item]] = selectItemsByTagIdQuery(tagId)
    .provideLayer(poolLayer)
}

object JdbcItemsStorage {
  val live: ZLayer[ZConnectionPool, Nothing, JdbcItemsStorage] = ZLayer.fromZIO {
    for {
      pool <- ZIO.service[ZConnectionPool]
    } yield JdbcItemsStorage(pool)
  }

  private implicit val schema: Schema[Item] =
    Schema.CaseClass3[Int, String, String, Item](
      TypeId.parse(classOf[Item].getTypeName),
      Field("id", Schema[Int], get0 = _.id, set0 = (x, v) => x.copy(id = v)),
      Field("name", Schema[String], get0 = _.name, set0 = (x, v) => x.copy(name = v)),
      Field("image", Schema[String], get0 = _.image, set0 = (x, v) => x.copy(image = v)),
      Item.apply,
    )

  private implicit val jdbcDecoder: JdbcDecoder[Item] = JdbcDecoder.fromSchema

  private def selectAllQuery = transaction {
    sql"SELECT * FROM item".query[Item].selectAll
  }

  private def selectItemByIdQuery(id: Int) = transaction {
    sql"SELECT * FROM item WHERE id = $id".query[Item].selectOne
  }

  private def selectItemsByTagIdQuery(tagId: Int) = transaction {
    sql"""SELECT id, name, image
          FROM item_tag JOIN item i ON item_tag.item_id = i.id
          WHERE item_tag.tag_id = $tagId""".query[Item].selectAll
  }
}