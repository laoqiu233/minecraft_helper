package io.dmtri.minecraft
package services

import config.Config.JwtConfig
import config.Config

import zio.{Task, ZIO, ZLayer}
import pdi.jwt.{JwtAlgorithm, JwtCirce, JwtClaim}

import java.time.Instant
import scala.util.Try

case class JwtTokenService(config: JwtConfig) extends TokenService {
  import JwtTokenService._

  override def generateTokenForUser(userId: Int): Try[String] = {
    val claims = JwtClaim()
      .issuedAt(Instant.now().getEpochSecond)
      .expiresAt(Instant.now().plusSeconds(config.expirationSeconds).getEpochSecond)
      .to(userId.toString)
      .by(config.issuer)

    Try(JwtCirce.encode(claims, config.secret, algorithm))
  }

  override def getUserIdFromToken(token: String): Try[Int] = {
    for {
      claims <- JwtCirce.decode(token, config.secret, Seq(algorithm))
      userId <- Try(claims.audience.get.head.toInt)
    } yield userId
  }
}

object JwtTokenService {
  private val algorithm = JwtAlgorithm.HS512

  val live = ZLayer.fromZIO(for {
    config <- ZIO.service[Config]
  } yield JwtTokenService(config.jwt))
}