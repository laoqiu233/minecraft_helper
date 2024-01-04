package io.dmtri.minecraft
package handlers

import models.ApiError
import models.Item._
import services.ItemDropService
import storage.{ItemsStorage, RecipeStorage}

import io.circe.generic.auto._
import io.circe.syntax._
import zio.http.{Method, Request, Response, Route, Routes, handler, int}
import zio.{URLayer, ZIO, ZLayer}

import scala.util.Try

case class ItemsHandler(
    itemsStorage: ItemsStorage,
    recipeStorage: RecipeStorage,
    dropService: ItemDropService
) {
  private val findByItemIdRoute: Route[Any, ApiError] =
    Method.GET / "api" / "items" / int("itemId") -> handler {
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
    Method.GET / "api" / "items" / int("itemId") / "drops" -> handler {
      (itemId: Int, req: Request) =>
        for {
          drops <- dropService.getAllDropsForItem(itemId)
          res <- ZIO.attempt(drops.asJson.toString).mapError(ApiError.InternalError)
        } yield Response.json(res)
    }

  private val findRecipesByItemIdRoute: Route[Any, ApiError] =
    Method.GET / "api" / "items" / int("itemId") / "recipes" -> handler {
      (itemId: Int, req: Request) =>
        for {
          recipes <- recipeStorage.getRecipesForItem(itemId, None).mapError(ApiError.InternalError)
          res <- ZIO.attempt(recipes.asJson.toString()).mapError(ApiError.InternalError)
        } yield Response.json(res)
    }

  private val listItemsRoute: Route[Any, ApiError] =
    Method.GET / "api" / "items" -> handler { (req: Request) =>
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
    findDropsByItemIdRoute,
    findRecipesByItemIdRoute
  )
}

object ItemsHandler {
  private type Env = ItemsStorage with ItemDropService with RecipeStorage
  val live: URLayer[Env, ItemsHandler] = ZLayer.fromFunction(ItemsHandler.apply _)
}
