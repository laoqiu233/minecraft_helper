package io.dmtri.minecraft
package storage

import io.dmtri.minecraft.models.User
import zio.Task

trait UserStorage {
  def getUserById(userId: Int): Task[Option[User]]
  def createUser(user: User): Task[Unit]
}
