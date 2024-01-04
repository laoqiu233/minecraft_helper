package io.dmtri.minecraft
package services

import config.Config.GithubOauthConfig

import io.circe.Decoder
import io.dmtri.minecraft.models.{ApiError, User}
import sttp.client3._
import sttp.client3.httpclient.zio.HttpClientZioBackend
import io.circe.parser.decode
import io.dmtri.minecraft.config.Config
import zio.{IO, ZIO, ZLayer}

case class GithubOauthService(config: GithubOauthConfig) {
  import GithubOauthService._
  private val backend = HttpClientZioBackend()

  private def decodeResponseOrError[T](
      body: String
  )(implicit decoder: Decoder[T]): Either[ApiError, T] =
    decode[T](body).left.map { _ =>
      decode[GithubErrorResponse](body) match {
        case Left(_) =>
          ApiError.OauthError(s"Unknown response from Github: $body")
        case Right(value) =>
          ApiError.OauthError(s"${value.error}: ${value.errorDescription}")
      }
    }

  def exchangeTokens(githubToken: String): IO[ApiError, String] = {
    val request = basicRequest
      .body(s"""
          |{
          | "client_id": "${config.clientId}",
          | "client_secret": "${config.clientSecret}",
          | "code": "${githubToken}"
          |}
          |""".stripMargin)
      .contentType("application/json")
      .header("Accept", "application/json")
      .post(tokenExchangeEndpoint)

    for {
      client <- backend.mapError(ApiError.InternalError)
      resp <- client.send(request).mapError(ApiError.InternalError)
      respBody <- ZIO.fromEither(resp.body).mapError(ApiError.OauthError)
      decodedResponse <- ZIO.fromEither(
        decodeResponseOrError[GithubTokenExchangeResponse](respBody)
      )
    } yield decodedResponse.accessToken
  }

  def getProfile(accessToken: String): IO[ApiError, User] = {
    val request = basicRequest
      .header("Authorization", s"bearer $accessToken")
      .header("Accept", "application/json")
      .get(profileEndpoint)

    for {
      client <- backend.mapError(ApiError.InternalError)
      resp <- client.send(request).mapError(ApiError.InternalError)
      respBody <- ZIO.fromEither(resp.body).mapError(ApiError.OauthError)
      decodedResponse <- ZIO
        .fromEither(decodeResponseOrError[GithubProfileResponse](respBody))
    } yield User(
      decodedResponse.id,
      decodedResponse.login,
      decodedResponse.avatarUrl
    )
  }
}

object GithubOauthService {
  private val tokenExchangeEndpoint =
    uri"https://github.com/login/oauth/access_token"

  private val profileEndpoint =
    uri"https://api.github.com/user"

  private case class GithubErrorResponse(
      error: String,
      errorDescription: String
  )
  private implicit val githubErrorResponseDecoder
      : Decoder[GithubErrorResponse] =
    Decoder.forProduct2("error", "error_description")(GithubErrorResponse.apply)

  private case class GithubTokenExchangeResponse(
      accessToken: String,
      scope: String,
      tokenType: String
  )
  private implicit val githubTokenExchangeResponseDecoder
      : Decoder[GithubTokenExchangeResponse] =
    Decoder.forProduct3("access_token", "scope", "token_type")(
      GithubTokenExchangeResponse.apply
    )

  private case class GithubProfileResponse(
      id: Int,
      login: String,
      avatarUrl: String
  )
  private implicit val githubProfileResponseDecoder
      : Decoder[GithubProfileResponse] =
    Decoder.forProduct3("id", "login", "avatar_url")(
      GithubProfileResponse.apply
    )

  val live: ZLayer[Config, Nothing, GithubOauthService] = {
    ZLayer.fromZIO(ZIO.serviceWith[Config](_.oauth.githubOauth)) >>>
      ZLayer.fromFunction(GithubOauthService.apply _)
  }
}
