package io.dmtri.minecraft

import io.dmtri.minecraft.config.Config
import io.dmtri.minecraft.handlers.{AuthHandler, AuthService, ItemsHandler, RecipeHandler}
import io.dmtri.minecraft.postgres.PostgresConnectionPool
import io.dmtri.minecraft.storage.{ItemDropStorage, ItemsStorage, RecipeStorage, UserStorage}
import io.dmtri.minecraft.storage.jdbc.{JdbcItemDropStorage, JdbcItemsStorage, JdbcRecipeStorage, JdbcUserStorage}
import zio.http._
import zio.{Scope, ULayer, URLayer, ZIO, ZIOAppArgs, ZIOAppDefault, ZLayer}
import zio.Console._
import zio.jdbc.ZConnectionPool
import io.dmtri.minecraft.models.ApiError._
import io.dmtri.minecraft.models.{BiomeItemDrop, ChestItemDrop, FishingItemDrop, GiftItemDrop, MobItemDrop}
import io.dmtri.minecraft.services.{GithubOauthService, ItemDropService, JwtTokenService}

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

    val app = ZLayer.fromZIO(
      for {
        itemsHandler <- ZIO.service[ItemsHandler]
        recipeHandler <- ZIO.service[RecipeHandler]
        authHandler <- ZIO.service[AuthHandler]
      } yield {
        itemsHandler.routes ++ recipeHandler.routes ++ authHandler.routes
      }.handleError(encodeErrorResponse).toHttpApp @@ Middleware.cors
    )

    ZLayer.make[Env](
      userStorage,
      recipeStorage,
      itemStorage,
      itemDropStorages,
      GithubOauthService.live,
      JwtTokenService.live,
      AuthService.live,
      ItemDropService.live,
      Config.configLive,
      ItemsHandler.live,
      RecipeHandler.live,
      AuthHandler.live,
      app
    )
  }

  override val run: ZIO[ZIOAppArgs with Scope, Any, Any] = {
    for {
      config <- ZIO.service[Config]
      app <- ZIO.service[HttpApp[Any]]
      _ <- printLine(s"Starting server on port ${config.api.port}")
      _ <- Server
        .serve(app)
        .provide(Server.defaultWith(_.port(config.api.port)))
    } yield ()
  }.provideLayer(makeEnv)
}
