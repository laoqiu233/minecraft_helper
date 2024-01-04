package io.dmtri.minecraft
package handlers

import services.{GithubOauthService, TokenService}

import io.dmtri.minecraft.models.ApiError.encodeErrorResponse
import io.dmtri.minecraft.models.{ApiError, User}
import io.dmtri.minecraft.storage.UserStorage
import zio.http.{HandlerAspect, Request, handler}
import zio.{IO, Task, URLayer, ZIO, ZLayer}
case class AuthService(
    tokenService: TokenService,
    userStorage: UserStorage,
    githubOauthService: GithubOauthService
) {
  private def decodeTokenFromRequest(req: Request): Either[ApiError, Int] = {
    import AuthService._
    val token = req.headers.get(authHeader).flatMap(extractToken)

    token match {
      case None =>
        Left(ApiError.AuthError("invalid token"))
      case Some(token) =>
        tokenService.getUserIdFromToken(token).toEither.left.map(err => ApiError.AuthError(err.toString))
    }
  }

  def authAspect: HandlerAspect[Any, Int] =
    HandlerAspect.interceptIncomingHandler(handler { (req: Request) =>
      decodeTokenFromRequest(req) match {
        case Left(value) => ZIO.fail(encodeErrorResponse(value))
        case Right(value) => ZIO.succeed((req, value))
      }
    })

  def optionalAuthAspect: HandlerAspect[Any, Option[Int]] =
    HandlerAspect.interceptIncomingHandler(handler { (req: Request) =>
      decodeTokenFromRequest(req) match {
        case Left(_) => ZIO.succeed((req, None))
        case Right(value) => ZIO.succeed((req, Some(value)))
      }
    })

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
