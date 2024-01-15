package io.dmtri.minecraft

import io.dmtri.minecraft.config.Config
import io.dmtri.minecraft.handlers.{
  AuthHandler,
  AuthService,
  ItemsHandler,
  RecipeHandler,
  WorldHandler
}
import io.dmtri.minecraft.models.ApiError
import io.dmtri.minecraft.postgres.PostgresConnectionPool
import io.dmtri.minecraft.storage.{
  ItemDropStorage,
  ItemsStorage,
  RecipeStorage,
  UserStorage,
  WorldStorage
}
import io.dmtri.minecraft.storage.jdbc.{
  JdbcItemDropStorage,
  JdbcItemsStorage,
  JdbcRecipeStorage,
  JdbcUserStorage,
  JdbcWorldStorage
}
import zio.http._
import zio.{Scope, ULayer, URLayer, ZIO, ZIOAppArgs, ZIOAppDefault, ZLayer}
import zio.Console._
import zio.jdbc.ZConnectionPool
import io.dmtri.minecraft.models.ApiError._
import io.dmtri.minecraft.services.{
  GithubOauthService,
  ItemDropService,
  JwtTokenService
}

object Main extends ZIOAppDefault {
  private type Env = HttpApp[Any] with Config

  private def makeEnv = {
    val pool = ZLayer.make[ZConnectionPool](
      Config.configLive,
      PostgresConnectionPool.connectionPoolLive
    )

    val itemStorage = ZLayer.make[ItemsStorage](
      pool,
      JdbcItemsStorage.live
    )

    val itemDropStorages = ZLayer.make[ItemDropStorage.AllDropStorages](
      pool,
      JdbcItemDropStorage.biomeItemDropLive,
      JdbcItemDropStorage.giftItemDropLive,
      JdbcItemDropStorage.fishingItemDropLive,
      JdbcItemDropStorage.mobItemDropLive,
      JdbcItemDropStorage.chestItemDropLive
    )

    val recipeStorage = ZLayer.make[RecipeStorage](
      pool,
      itemStorage,
      JdbcRecipeStorage.live
    )

    val userStorage = ZLayer.make[UserStorage](
      pool,
      JdbcUserStorage.live
    )

    val worldStorage = ZLayer.make[WorldStorage](
      pool,
      JdbcWorldStorage.live
    )

    val app = ZLayer.fromZIO(
      for {
        itemsHandler <- ZIO.service[ItemsHandler]
        recipeHandler <- ZIO.service[RecipeHandler]
        authHandler <- ZIO.service[AuthHandler]
        worldHandler <- ZIO.service[WorldHandler]
      } yield {
        itemsHandler.routes ++ recipeHandler.routes ++ authHandler.routes ++ worldHandler.routes
      }.handleError(encodeErrorResponse).toHttpApp @@ Middleware.cors
    )

    ZLayer.make[Env](
      Config.configLive,
      userStorage,
      recipeStorage,
      itemStorage,
      itemDropStorages,
      worldStorage,
      GithubOauthService.live,
      JwtTokenService.live,
      ItemDropService.live,
      AuthService.live,
      ItemsHandler.live,
      RecipeHandler.live,
      AuthHandler.live,
      WorldHandler.live,
      app
    )
  }

  private val indexHandler = Routes(
    Method.GET / "" -> Handler
      .fromResource("index.html")
      .mapError(ApiError.InternalError)
  ).handleError(encodeErrorResponse).toHttpApp

  private val staticFilesHandler =
    Routes.empty.toHttpApp @@ Middleware.serveResources(Path.empty)

  override val run: ZIO[ZIOAppArgs with Scope, Any, Any] = {
    for {
      config <- ZIO.service[Config]
      app <- ZIO.service[HttpApp[Any]]
      _ <- printLine(s"Starting server on port ${config.api.port}")
      _ <- Server
        .serve(app ++ indexHandler ++ staticFilesHandler)
        .provide(Server.defaultWith(_.port(config.api.port)))
    } yield ()
  }.provideLayer(makeEnv)
}
