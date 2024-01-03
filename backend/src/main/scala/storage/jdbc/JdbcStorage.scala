package io.dmtri.minecraft
package storage.jdbc

import zio.{ULayer, ZLayer}
import zio.jdbc.{JdbcDecoder, JdbcEncoder, ZConnectionPool}
import zio.schema.Schema

trait JdbcStorage {
  def pool: ZConnectionPool
  def poolLayer: ULayer[ZConnectionPool] = ZLayer.succeed(pool)
}
