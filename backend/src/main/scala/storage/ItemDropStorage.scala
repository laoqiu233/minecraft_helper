package io.dmtri.minecraft
package storage

import models.ItemDrop

import zio.Task

trait ItemDropStorage[T <: ItemDrop] {
  def getDrops: Task[Seq[T]]
  def getDropsForItem(itemId: Int): Task[Seq[T]]
}
