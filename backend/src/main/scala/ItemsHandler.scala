package io.dmtri.minecraft

import storage.ItemsStorage

import io.dmtri.minecraft.models.ApiError
import zio.http.{Method, Request, Response, Route, Routes, Status, handler, int}
import io.dmtri.minecraft.models.Item._
import zio.{ZIO, ZLayer}
import io.circe.syntax._

import scala.util.Try

case class ItemsHandler (itemsStorage: ItemsStorage) {
  private val findByItemIdRoute: Route[Any, ApiError] = Method.GET / "items" / int("itemId") -> handler { (itemId: Int, req: Request) =>
    for {
      itemOpt <- itemsStorage.getItemById(itemId).mapError(ApiError.InternalError)
      item <- ZIO.fromOption(itemOpt).mapError(_ => ApiError.NotFoundError("item not found"))
    } yield Response.json(item.asJson.toString)
  }

  private val listItemsRoute: Route[Any, ApiError] = Method.GET / "items" -> handler { (req: Request) =>
    req.url.queryParams.get("tag") match {
      case None =>
        for {
          items <- itemsStorage.getAllItems.mapError(ApiError.InternalError)
        } yield Response.json(items.asJson.toString())
      case Some(tagId) =>
        for {
          tagId <- ZIO.fromTry(Try(tagId.toInt)).mapError(_ => ApiError.InvalidRequestError("invalid tag id"))
          items <- itemsStorage.getItemsByTagId(tagId).mapError(ApiError.InternalError)
        } yield Response.json(items.asJson.toString())
    }
  }

  val routes: Routes[Any, ApiError] = Routes(
    findByItemIdRoute,
    listItemsRoute
  )
}

object ItemsHandler {
  val live: ZLayer[ItemsStorage, Nothing, ItemsHandler] = ZLayer.fromZIO(for {
    itemsStorage <- ZIO.service[ItemsStorage]
  } yield ItemsHandler(itemsStorage))
}
