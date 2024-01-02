package io.dmtri.minecraft

import storage.{ItemDropStorage, ItemsStorage}

import io.dmtri.minecraft.models.{
  ApiError,
  BiomeItemDrop,
  ChestItemDrop,
  FishingItemDrop,
  GiftItemDrop,
  ItemDrops,
  MobItemDrop
}
import zio.http.{Method, Request, Response, Route, Routes, Status, handler, int}
import io.dmtri.minecraft.models.Item._
import zio.{ZIO, ZLayer}
import io.circe.syntax._
import io.circe.generic.auto._

import scala.util.Try

case class ItemsHandler(
    itemsStorage: ItemsStorage,
    biomeDropsStorage: ItemDropStorage[BiomeItemDrop],
    giftDropsStorage: ItemDropStorage[GiftItemDrop],
    fishingDropsStroage: ItemDropStorage[FishingItemDrop],
    mobDropsStorage: ItemDropStorage[MobItemDrop],
    chestDropsStorage: ItemDropStorage[ChestItemDrop]
) {
  private val findByItemIdRoute: Route[Any, ApiError] =
    Method.GET / "items" / int("itemId") -> handler {
      (itemId: Int, req: Request) =>
        for {
          itemOpt <- itemsStorage
            .getItemById(itemId)
            .mapError(ApiError.InternalError)
          item <- ZIO
            .fromOption(itemOpt)
            .mapError(_ => ApiError.NotFoundError("item not found"))
        } yield Response.json(item.asJson.toString)
    }

  private val findDropsByItemIdRoute: Route[Any, ApiError] =
    Method.GET / "items" / int("itemId") / "drops" -> handler {
      (itemId: Int, req: Request) =>
        for {
          drops <-
            biomeDropsStorage.getDropsForItem(itemId) zipPar
              giftDropsStorage.getDropsForItem(itemId) zipPar
              fishingDropsStroage.getDropsForItem(itemId) zipPar
              mobDropsStorage.getDropsForItem(itemId) zipPar
              chestDropsStorage.getDropsForItem(
                itemId
              ) mapError (ApiError.InternalError)
          dropsDto = (ItemDrops.apply _).tupled(drops)
          res <- ZIO.attempt(dropsDto.asJson.toString).mapError(ApiError.InternalError)
        } yield Response.json(res)
    }

  private val listItemsRoute: Route[Any, ApiError] =
    Method.GET / "items" -> handler { (req: Request) =>
      req.url.queryParams.get("tag") match {
        case None =>
          for {
            items <- itemsStorage.getAllItems.mapError(ApiError.InternalError)
          } yield Response.json(items.asJson.toString())
        case Some(tagId) =>
          for {
            tagId <- ZIO
              .fromTry(Try(tagId.toInt))
              .mapError(_ => ApiError.InvalidRequestError("invalid tag id"))
            items <- itemsStorage
              .getItemsByTagId(tagId)
              .mapError(ApiError.InternalError)
          } yield Response.json(items.asJson.toString())
      }
    }

  val routes: Routes[Any, ApiError] = Routes(
    findByItemIdRoute,
    listItemsRoute,
    findDropsByItemIdRoute
  )
}

object ItemsHandler {
  val live: ZLayer[ItemsStorage
    with ItemDropStorage[BiomeItemDrop]
    with ItemDropStorage[GiftItemDrop]
    with ItemDropStorage[FishingItemDrop]
    with ItemDropStorage[MobItemDrop]
    with ItemDropStorage[ChestItemDrop], Nothing, ItemsHandler] = ZLayer.fromFunction(ItemsHandler.apply _)
}
