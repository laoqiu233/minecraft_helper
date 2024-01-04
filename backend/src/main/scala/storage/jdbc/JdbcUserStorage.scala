package io.dmtri.minecraft
package storage.jdbc

import storage.UserStorage

import io.dmtri.minecraft.models.User
import zio.{Task, URLayer, ZIO, ZLayer}
import zio.jdbc.{ZConnectionPool, sqlInterpolator, transaction}

case class JdbcUserStorage (pool: ZConnectionPool) extends UserStorage with JdbcStorage {
  import JdbcUserStorage._

  override def getUserById(userId: Int): Task[Option[User]] = transaction {
    getUserQuery(userId)
  }.provideLayer(poolLayer)

  override def createUser(user: User): Task[Unit] = transaction {
    for {
      insertResult <- createUserQuery(user)
      _ <- if (insertResult == 1) ZIO.unit
           else ZIO.fail(new IllegalArgumentException("user already exists"))
    } yield ()
  }.provideLayer(poolLayer)
}

object JdbcUserStorage {
  val live: URLayer[ZConnectionPool, JdbcUserStorage] = ZLayer.fromFunction(JdbcUserStorage.apply _)

  private def getUserQuery(userId: Int) =
    sql"""
        SELECT id, username, avatar_url
        FROM "user"
        WHERE id = $userId
       """.query[(Int, String, String)].selectOne.map(_.map((User.apply _).tupled))

  private def createUserQuery(user: User) =
    sql"""
         INSERT INTO "user" (id, username, avatar_url)
         VALUES (${user.id}, ${user.username}, ${user.avatarUrl})
       """.insert
}