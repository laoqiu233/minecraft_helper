package io.dmtri.minecraft

import storage.ItemsStorage

import zio.http.{Method, Request, Response, Route, Routes, Status, handler, int}
import io.dmtri.minecraft.models.Item._
import zio.{ZIO, ZLayer}
import zio.json._

import scala.util.Try

case class ItemsHandler (itemsStorage: ItemsStorage) {
  private val findByItemIdRoute: Route[Any, Throwable] = Method.GET / "items" / int("itemId") -> handler { (itemId: Int, req: Request) =>
    for {
      item <- itemsStorage.getItemById(itemId)
    } yield item.map(i => Response.json(i.toJson)).getOrElse(Response.error(Status.NotFound, "not found"))
  }

  private val listItemsRoute: Route[Any, Throwable] = Method.GET / "items" -> handler { (req: Request) =>
    req.url.queryParams.get("tag") match {
      case None =>
        for {
          items <- itemsStorage.getAllItems
        } yield Response.json(items.toJson)
      case Some(tagId) =>
        for {
          tagId <- ZIO.fromTry(Try(tagId.toInt))
          items <- itemsStorage.getItemsByTagId(tagId)
        } yield Response.json(items.toJson)
    }
  }

  val routes: Routes[Any, Throwable] = Routes(
    findByItemIdRoute,
    listItemsRoute
  )
}

object ItemsHandler {
  val live: ZLayer[ItemsStorage, Nothing, ItemsHandler] = ZLayer.fromZIO(for {
    itemsStorage <- ZIO.service[ItemsStorage]
  } yield ItemsHandler(itemsStorage))
}
