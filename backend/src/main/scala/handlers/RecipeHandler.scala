package io.dmtri.minecraft
package handlers

import storage.RecipeStorage

import io.dmtri.minecraft.models.ApiError
import zio.{ZIO, ZLayer}
import zio.http.{Method, Request, Response, Route, Routes, handler, int}
import io.circe.generic.auto._
import io.circe.syntax._

case class RecipeHandler (recipeStorage: RecipeStorage) {
  private val getRecipeByIdRoute: Route[Any, ApiError] =
    Method.GET / "api" / "recipes" / int("recipeId") -> handler { (recipeId: Int, req: Request) =>
      val recipeQuery = recipeStorage.getRecipeById(recipeId).mapError(ApiError.InternalError)

      for {
        recipe <- recipeQuery.someOrFail(ApiError.NotFoundError("recipe not found"))
        res <- ZIO.attempt(recipe.asJson.toString()).mapError(ApiError.InternalError)
      } yield Response.json(res)
    }

  val routes = Routes(
    getRecipeByIdRoute
  )
}

object RecipeHandler {
  val live = ZLayer.fromFunction(RecipeHandler.apply _)
}
