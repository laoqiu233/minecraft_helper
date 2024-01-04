package io.dmtri.minecraft

import io.dmtri.minecraft
import io.dmtri.minecraft.config.Config
import io.dmtri.minecraft.config.Config.PostgresConfig
import io.dmtri.minecraft.handlers.{ItemsHandler, RecipeHandler}
import io.dmtri.minecraft.postgres.PostgresConnectionPool
import io.dmtri.minecraft.storage.{ItemDropStorage, ItemsStorage, RecipeStorage}
import io.dmtri.minecraft.storage.jdbc.{
  JdbcItemDropStorage,
  JdbcItemsStorage,
  JdbcRecipeStorage
}
import zio.http._
import zio.{Scope, ULayer, URLayer, ZIO, ZIOAppArgs, ZIOAppDefault, ZLayer}
import zio.Console._
import zio.jdbc.ZConnectionPool
import io.dmtri.minecraft.models.Item._
import io.dmtri.minecraft.models.ApiError._
import io.dmtri.minecraft.models.{
  BiomeItemDrop,
  ChestItemDrop,
  FishingItemDrop,
  GiftItemDrop,
  MobItemDrop
}
import io.dmtri.minecraft.services.ItemDropService
import zio.json._

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

    val itemDropStorages = ZLayer.make[ItemDropStorage[
      BiomeItemDrop
    ] with ItemDropStorage[GiftItemDrop] with ItemDropStorage[
      FishingItemDrop
    ] with ItemDropStorage[MobItemDrop] with ItemDropStorage[ChestItemDrop]](
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

    val app = ZLayer.fromZIO(
      for {
        itemsHandler <- ZIO.service[ItemsHandler]
        recipeHandler <- ZIO.service[RecipeHandler]
      } yield {
        itemsHandler.routes ++ recipeHandler.routes
      }.handleError(encodeErrorResponse).toHttpApp
    )

    ZLayer.make[Env](
      recipeStorage,
      itemStorage,
      itemDropStorages,
      ItemDropService.live,
      Config.configLive,
      ItemsHandler.live,
      RecipeHandler.live,
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
