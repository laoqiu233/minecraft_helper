package io.dmtri.minecraft
package handlers

import storage.RecipeStorage

import io.dmtri.minecraft.models.{ApiError, LikeStatus}
import zio.{ZIO, ZLayer}
import zio.http.{Method, Request, Response, Route, Routes, handler, int}
import io.circe.generic.auto._
import io.circe.syntax._

case class RecipeHandler(
    recipeStorage: RecipeStorage,
    authService: AuthService
) {
  import RecipeHandler._

  private val getRecipeByIdRoute: Route[Any, ApiError] =
    Method.GET / "api" / "recipes" / int("recipeId") ->
      authService.optionalAuthAspect ->
      handler { (params: (Int, Option[Int]), req: Request) =>
        val recipeId = params._1
        val userId = params._2

        val recipeQuery = recipeStorage
          .getRecipeById(recipeId, userId)
          .mapError(ApiError.InternalError)

        for {
          recipe <- recipeQuery.someOrFail(
            ApiError.NotFoundError("recipe not found")
          )
          res <- ZIO
            .attempt(recipe.asJson.toString())
            .mapError(ApiError.InternalError)
        } yield Response.json(res)
      }

  private val likeRecipe =
    Method.PATCH / "api" / "recipes" / int("recipeId") / "like" ->
      (authService.authAspect ++
        ParseBodyAspect.parseJson[RecipeLikeStatusRequest]) ->
      handler { (params: (Int, (Int, RecipeLikeStatusRequest)), req: Request) =>
        params match {
          case (recipeId, (userId, likeStatus)) =>
            for {
              _ <- recipeStorage
                .changeRecipeLikeStatus(recipeId, userId, likeStatus.status)
                .mapError(ApiError.InternalError)
            } yield Response.ok
        }
      }

  val routes = Routes(
    getRecipeByIdRoute,
    likeRecipe
  )
}

object RecipeHandler {
  val live = ZLayer.fromFunction(RecipeHandler.apply _)

  private final case class RecipeLikeStatusRequest(status: LikeStatus)
}
