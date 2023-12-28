package io.dmtri.minecraft
package storage.jdbc

import zio.{ULayer, ZLayer}
import zio.jdbc.{JdbcDecoder, JdbcEncoder, ZConnectionPool}
import zio.schema.Schema

trait JdbcStorage[T] {
  def pool: ZConnectionPool
  def poolLayer: ULayer[ZConnectionPool] = ZLayer.succeed(pool)
  protected implicit val schema: Schema[T]
  protected implicit lazy val jdbcDecoder: JdbcDecoder[T] = JdbcDecoder.fromSchema
  protected implicit lazy val jdbcEncoder: JdbcEncoder[T] = JdbcEncoder.fromSchema
}
