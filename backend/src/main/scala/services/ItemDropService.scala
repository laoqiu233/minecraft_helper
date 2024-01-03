package io.dmtri.minecraft
package services

import models.{
  ApiError,
  BiomeItemDrop,
  ChestItemDrop,
  FishingItemDrop,
  GiftItemDrop,
  ItemDrops,
  MobItemDrop
}
import storage.ItemDropStorage

import zio.{IO, ZLayer}

case class ItemDropService(
    biomeDropsStorage: ItemDropStorage[BiomeItemDrop],
    giftDropsStorage: ItemDropStorage[GiftItemDrop],
    fishingDropsStroage: ItemDropStorage[FishingItemDrop],
    mobDropsStorage: ItemDropStorage[MobItemDrop],
    chestDropsStorage: ItemDropStorage[ChestItemDrop]
) {
  def getAllDropsForItem(itemId: Int): IO[ApiError, ItemDrops] =
    for {
      drops <- biomeDropsStorage.getDropsForItem(itemId) zipPar
        giftDropsStorage.getDropsForItem(itemId) zipPar
        fishingDropsStroage.getDropsForItem(itemId) zipPar
        mobDropsStorage.getDropsForItem(itemId) zipPar
        chestDropsStorage.getDropsForItem(
          itemId
        ) mapError (ApiError.InternalError)
    } yield (ItemDrops.apply _) tupled drops
}

object ItemDropService {
  val live: ZLayer[ItemDropStorage.AllDropStorages, Nothing, ItemDropService] =
    ZLayer.fromFunction(ItemDropService.apply _)
}
