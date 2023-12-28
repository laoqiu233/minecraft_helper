package io.dmtri.minecraft

import io.dmtri.minecraft
import io.dmtri.minecraft.config.Config
import io.dmtri.minecraft.config.Config.PostgresConfig
import io.dmtri.minecraft.postgres.PostgresConnectionPool
import io.dmtri.minecraft.storage.ItemsStorage
import io.dmtri.minecraft.storage.jdbc.JdbcItemsStorage
import zio.http._
import zio.{Scope, ULayer, URLayer, ZIO, ZIOAppArgs, ZIOAppDefault, ZLayer}
import zio.Console._
import zio.jdbc.ZConnectionPool
import io.dmtri.minecraft.models.Item._
import zio.json._

object Main extends ZIOAppDefault {
  private type Env = HttpApp[Any]
    with Config

  private def makeEnv = {
    val storage = ZLayer.make[ItemsStorage](
      Config.configLive,
      PostgresConnectionPool.connectionPoolLive,
      JdbcItemsStorage.live
    )

    val app = ZLayer.fromZIO(for {
      itemsHandler <- ZIO.service[ItemsHandler]
    } yield itemsHandler.routes.handleError(err => Response.error(Status.InternalServerError, err.getMessage)).toHttpApp)

    ZLayer.make[Env](
      storage,
      Config.configLive,
      ItemsHandler.live,
      app
    )
  }

  override val run: ZIO[ZIOAppArgs with Scope, Any, Any] = {
    for {
      config <- ZIO.service[Config]
      app <- ZIO.service[HttpApp[Any]]
      _ <- printLine(s"Starting server on port ${config.api.port}")
      _ <- Server.serve(app).provide(Server.defaultWith(_.port(config.api.port)))
    } yield ()
  }.provideLayer(makeEnv)
}