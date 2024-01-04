package io.dmtri.minecraft
package handlers

import services.TokenService

import io.dmtri.minecraft.config.Config.OauthConfig
import io.dmtri.minecraft.models.ApiError
import zio.{URLayer, ZIO, ZLayer}
import zio.http.{Method, Request, Response, Route, Routes, handler, int}
import io.circe.syntax._
import io.circe.generic.auto._

import scala.util.{Failure, Success}

case class AuthHandler(authService: AuthService) {
  import AuthHandler._

  private val getTokenRoute: Route[Any, ApiError] =
    Method.GET / "api" / "auth" / int("userId") -> handler {
      (userId: Int, req: Request) =>
        authService.tokenService.generateTokenForUser(userId) match {
          case Success(token) =>
            Response.text(token)
          case Failure(exception) =>
            Response.text(exception.toString)
        }
    }

  private val oauthGithubRoute: Route[Any, ApiError] =
    Method.GET / "api" / "auth" / "github" -> handler { (req: Request) =>
      for {
        token <- ZIO.fromOption(req.url.queryParams.get("token")).mapError(_ => ApiError.InvalidRequestError("no token in query params"))
        user <- authService.loadUserFromGithub(token)
        accessToken <- ZIO.fromTry(authService.tokenService.generateTokenForUser(user.id)).mapError(ApiError.InternalError)
      } yield Response.json(AccessTokenResponse(accessToken).asJson.toString)
    }

  private val getProfileRoute: Route[Any, ApiError] =
    Method.GET / "api" / "auth" / "user" ->
      authService.authAspect ->
      handler { (userId: Int, req: Request) =>
        for {
          userOpt <- authService.userStorage.getUserById(userId).mapError(ApiError.InternalError)
          user <- ZIO.fromOption(userOpt).mapError(_ => ApiError.NotFoundError("user not found"))
        } yield Response.json(user.asJson.toString)
      }

  val routes = Routes(
    getTokenRoute,
    oauthGithubRoute,
    getProfileRoute
  )
}

object AuthHandler {
  private case class AccessTokenResponse(accessToken: String)

  val live: URLayer[AuthService, AuthHandler] =
    ZLayer.fromFunction(AuthHandler.apply _)
}
