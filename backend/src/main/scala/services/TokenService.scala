package io.dmtri.minecraft
package services

import zio.Task

import scala.util.Try

trait TokenService {
  def generateTokenForUser(userId: Int): Try[String]
  def getUserIdFromToken(token: String): Try[Int]
}
