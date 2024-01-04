package io.dmtri.minecraft
package storage.jdbc

import io.dmtri.minecraft.models.{Recipe, LikeStatus}
import io.dmtri.minecraft.storage.{ItemsStorage, RecipeStorage}
import zio.{Task, URLayer, ZIO, ZLayer}
import zio.jdbc.{ZConnectionPool, sqlInterpolator, transaction}

case class JdbcRecipeStorage(pool: ZConnectionPool, itemsStorage: ItemsStorage)
    extends RecipeStorage
    with JdbcStorage {
  private def getIngredientsForRecipe(recipeId: Int) = {
    val ingredientsQuery =
      sql"""
         SELECT ing_symbol, item_or_tag_flag, item_id, tag_id
         FROM ingredient
         WHERE craft_id = $recipeId
         """.query[(String, Boolean, Int, Int)].selectAll

    ingredientsQuery
      .flatMap { ingredients =>
        ingredients.mapZIO { case (symbol, flag, itemId, tagId) =>
          if (flag)
            for {
              item <- itemsStorage.getItemById(itemId)
            } yield symbol -> Seq(item).flatten
          else
            for {
              items <- itemsStorage.getItemsByTagId(tagId)
            } yield symbol -> items
        }
      }
      .map(_.toMap)
  }

  private def getRecipeExtData(recipeId: Int) =
    sql"""
         SELECT craft_pattern, smelt_time
         FROM recipe_extra_data
         WHERE id = $recipeId
       """
      .query[(Option[String], Option[Int])]
      .selectOne
      .map(_.getOrElse((None, None)))

  private def makeRecipe(
      recipeId: Int,
      resultItemId: Int,
      resultAmount: Int,
      craftType: String,
      category: Option[String],
      group: Option[String]
  ) =
    for {
      resultItem <- itemsStorage
        .getItemById(resultItemId)
        .someOrFail(
          new IllegalArgumentException("Could not find result item")
        )
      ingredients <- getIngredientsForRecipe(recipeId)
      extData <- getRecipeExtData(recipeId)
      (pattern, smeltTime) = extData
    } yield craftType match {
      case "minecraft:crafting_shaped_3" | "minecraft:crafting_shaped_2" =>
        Recipe.CraftingShaped(
          recipeId,
          category,
          group,
          ingredients,
          resultItem,
          resultAmount,
          pattern.getOrElse("")
        )
      case "minecraft:crafting_shapeless" =>
        Recipe.CraftingShapeless(
          recipeId,
          category,
          group,
          ingredients.values.toSeq,
          resultItem,
          resultAmount
        )
      case "minecraft:smelting" | "minecraft:blasting" =>
        Recipe.Smelting(
          recipeId,
          category,
          group,
          ingredients.values.flatten.head,
          resultItem,
          resultAmount,
          smeltTime.getOrElse(0),
          craftType.slice(10, craftType.length)
        )
      case _ =>
        Recipe.Other(
          recipeId,
          category,
          group,
          resultItem,
          resultAmount,
          ingredients
        )
    }

  private def getRecipe(recipeId: Int) = {
    val recipeQuery =
      sql"""
         SELECT result_item, result_amount, craft_type, craft_category, craft_group
         FROM recipe
         WHERE id = $recipeId
         """.query[(Int, Int, String, Option[String], Option[String])].selectOne

    recipeQuery.flatMap {
      case Some((resultItem, resultAmount, craftType, category, group)) =>
        makeRecipe(recipeId, resultItem, resultAmount, craftType, category, group).map(Some(_))
      case None => ZIO.succeed(None)
    }
  }

  override def getRecipeById(recipeId: Int): Task[Option[Recipe]] =
    transaction {
      getRecipe(recipeId)
    }.provideLayer(poolLayer)

  override def getRecipesForItem(itemId: Int): Task[Seq[Recipe]] = transaction {
    val recipesQuery =
      sql"""
         SELECT id
         FROM recipe
         WHERE result_item = $itemId
         """.query[Int].selectAll
    recipesQuery.flatMap(_.mapZIO(getRecipe).map(_.flatten))
  }.provideLayer(poolLayer)

  override def changeRecipeLikeStatus(recipeId: Int, userId: Int, status: LikeStatus): Task[Unit] = ???
}

object JdbcRecipeStorage {
  val live: URLayer[ZConnectionPool with ItemsStorage, JdbcRecipeStorage] =
    ZLayer.fromFunction(JdbcRecipeStorage.apply _)
}
