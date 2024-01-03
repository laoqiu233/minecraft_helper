package io.dmtri.minecraft
package storage

import io.dmtri.minecraft.models.Recipe
import zio.Task

trait RecipeStorage {
  def getRecipeById(recipeId: Int): Task[Option[Recipe]]
  def getRecipesForItem(itemId: Int): Task[Seq[Recipe]]
}
