package io.dmtri.minecraft
package storage.jdbc

import io.dmtri.minecraft.models.{LikeStatus, Recipe}
import io.dmtri.minecraft.storage.{ItemsStorage, RecipeStorage}
import shapeless.syntax.std.tuple.productTupleOps
import zio.{Task, URLayer, ZIO, ZLayer}
import zio.jdbc.{ZConnection, ZConnectionPool, sqlInterpolator, transaction}

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
      group: Option[String],
      likeStatus: LikeStatus
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
          pattern.getOrElse(""),
          likeStatus
        )
      case "minecraft:crafting_shapeless" =>
        Recipe.CraftingShapeless(
          recipeId,
          category,
          group,
          ingredients.values.toSeq,
          resultItem,
          resultAmount,
          likeStatus
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
          craftType.slice(10, craftType.length),
          likeStatus
        )
      case _ =>
        Recipe.Other(
          recipeId,
          category,
          group,
          resultItem,
          resultAmount,
          ingredients,
          likeStatus
        )
    }

  private def getLikeQuery(recipeId: Int, userId: Int) = {
    val likeQuery =
      sql"""
        SELECT is_like
        FROM user_recipe_like
        WHERE user_id = $userId AND recipe_id = $recipeId
         """.query[Boolean].selectOne

    for {
      isLike <- likeQuery
    } yield isLike match {
      case Some(value) =>
        if (value) LikeStatus.Like
        else LikeStatus.Dislike
      case None => LikeStatus.NoStatus
    }
  }

  private def getRecipe(recipeId: Int, userId: Option[Int])  = {
    val recipeQuery =
      sql"""
         SELECT id, result_item, result_amount, craft_type, craft_category, craft_group
         FROM recipe
         WHERE id = $recipeId
         """.query[(Int, Int, Int, String, Option[String], Option[String])].selectOne

    val likeStatusZio = userId match {
      case Some(value) => getLikeQuery(recipeId, value)
      case None => ZIO.succeed(LikeStatus.NoStatus)
    }

    for {
      recipeDataOpt <- recipeQuery
      likeStatus <- likeStatusZio
      recipe <- recipeDataOpt.map(data => (makeRecipe _).tupled(data :+ likeStatus).map(Some(_))).getOrElse(ZIO.none)
    } yield recipe
  }

  override def getRecipeById(recipeId: Int, userId: Option[Int]): Task[Option[Recipe]] =
    transaction {
      getRecipe(recipeId, userId)
    }.provideLayer(poolLayer)

  override def getRecipesForItem(itemId: Int, userId: Option[Int]): Task[Seq[Recipe]] = transaction {
    val recipesQuery =
      sql"""
         SELECT id
         FROM recipe
         WHERE result_item = $itemId
         """.query[Int].selectAll
    recipesQuery.flatMap(_.mapZIO(getRecipe(_, userId)).map(_.flatten))
  }.provideLayer(poolLayer)

  override def changeRecipeLikeStatus(recipeId: Int, userId: Int, status: LikeStatus): Task[Unit] = transaction {
    val deletePreviousLikeQuery =
      sql"""
         DELETE FROM user_recipe_like
         WHERE user_id = $userId AND recipe_id = $recipeId
       """.delete

    val insertLikeQuery =
      sql"""
           INSERT INTO user_recipe_like (user_id, recipe_id, is_like, ts)
           VALUES ($userId, $recipeId, ${status == LikeStatus.Like}, now())
         """.insert

    for {
      _ <- deletePreviousLikeQuery
      _ <- if (status != LikeStatus.NoStatus) insertLikeQuery
        else ZIO.unit
    } yield ()
  }.provideLayer(poolLayer)
}

object JdbcRecipeStorage {
  val live: URLayer[ZConnectionPool with ItemsStorage, JdbcRecipeStorage] =
    ZLayer.fromFunction(JdbcRecipeStorage.apply _)
}
