package io.dmtri.minecraft
package storage

import io.dmtri.minecraft.models.{Recipe, LikeStatus}
import zio.Task

trait RecipeStorage {
  def getRecipeById(recipeId: Int, userId: Option[Int]): Task[Option[Recipe]]

  def getRecipesForItem(itemId: Int, userId: Option[Int]): Task[Seq[Recipe]]

  def changeRecipeLikeStatus(recipeId: Int, userId: Int, status: LikeStatus): Task[Unit]
}