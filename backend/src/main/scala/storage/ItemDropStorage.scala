package io.dmtri.minecraft
package storage

import models.{
  BiomeItemDrop,
  ChestItemDrop,
  FishingItemDrop,
  GiftItemDrop,
  ItemDrop,
  MobItemDrop
}

import zio.Task

trait ItemDropStorage[T <: ItemDrop] {
  def getDrops: Task[Seq[T]]
  def getDropsForItem(itemId: Int): Task[Seq[T]]
}

object ItemDropStorage {
  type AllDropStorages = ItemDropStorage[BiomeItemDrop]
      with ItemDropStorage[GiftItemDrop]
      with ItemDropStorage[FishingItemDrop]
      with ItemDropStorage[MobItemDrop]
      with ItemDropStorage[ChestItemDrop]
}
