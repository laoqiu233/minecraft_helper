package io.dmtri.minecraft
package postgres

import config.Config

import zio.{Scope, ZIO, ZLayer}
import zio.jdbc.{ZConnectionPool, ZConnectionPoolConfig}

object PostgresConnectionPool {
  private val connectionPoolConfigLive = ZLayer.succeed(ZConnectionPoolConfig.default)
  val connectionPoolLive: ZLayer[Config, Throwable, ZConnectionPool] = connectionPoolConfigLive >>> ZLayer.fromZIO(for {
    config <- ZIO.service[Config]
    pg = config.postgres
  } yield ZConnectionPool.postgres(pg.host, pg.port, pg.db, pg.getProperties)).flatten
}
