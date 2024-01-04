package io.dmtri.minecraft
package handlers

import services.{GithubOauthService, TokenService}

import io.dmtri.minecraft.models.{ApiError, User}
import io.dmtri.minecraft.storage.UserStorage
import zio.http.{HandlerAspect, Request, handler}
import zio.{IO, Task, URLayer, ZIO, ZLayer}
case class AuthService(
    tokenService: TokenService,
    userStorage: UserStorage,
    githubOauthService: GithubOauthService
) {
  import AuthService._

  def authAspect: HandlerAspect[Any, Int] =
    HandlerAspect.interceptIncomingHandler(handler { (req: Request) =>
      val token = req.headers.get(authHeader).flatMap(extractToken)

      token match {
        case None =>
          ZIO.fail(ApiError.AuthError("invalid token"))
        case Some(token) =>
          ZIO
            .fromTry(tokenService.getUserIdFromToken(token))
            .map((req, _))
            .mapError(err => ApiError.AuthError(err.toString))
      }
    }.mapError(ApiError.encodeErrorResponse))

  def loadUserFromGithub(githubToken: String): IO[ApiError, User] = {
    for {
      token <- githubOauthService.exchangeTokens(githubToken)
      userFromGithub <- githubOauthService.getProfile(token)
      userFromStorage <- userStorage
        .getUserById(userFromGithub.id)
        .mapError(ApiError.InternalError)
      user <- userFromStorage match {
        case Some(value) => ZIO.succeed(value)
        case None =>
          userStorage
            .createUser(userFromGithub)
            .map(_ => userFromGithub)
            .mapError(ApiError.InternalError)
      }
    } yield user
  }
}

object AuthService {
  private val authHeader = "Authorization"
  private val authType = "bearer"

  private def extractToken(rawHeader: String): Option[String] =
    if (rawHeader.startsWith(authType))
      Some(rawHeader.slice(authType.length + 1, rawHeader.length))
    else None

  private type Env = TokenService with UserStorage with GithubOauthService

  val live: URLayer[Env, AuthService] = ZLayer.fromFunction(AuthService.apply _)
}
