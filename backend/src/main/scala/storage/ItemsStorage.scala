package io.dmtri.minecraft
package storage

import models.Item

import zio.Task

trait ItemsStorage {
  def getAllItems: Task[Seq[Item]]
  def getItemById(id: Int): Task[Option[Item]]
  def getItemsByTagId(tagId: Integer): Task[Seq[Item]]
}
