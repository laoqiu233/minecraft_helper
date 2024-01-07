package io.dmtri.minecraft
package models

sealed trait Recipe {
  def id: Int
  def recipeType: String
  def recipeCategory: Option[String]
  def recipeGroup: Option[String]
  def resultItem: Item
  def resultItemAmount: Int
}

object Recipe {
  case class CraftingShaped(
      id: Int,
      recipeCategory: Option[String],
      recipeGroup: Option[String],
      ingredients: Map[String, Seq[Item]],
      resultItem: Item,
      resultItemAmount: Int,
      craftPattern: String,
      likeStatus: LikeStatus = LikeStatus.NoStatus
  ) extends Recipe {
    override def recipeType: String =
      if (
        craftPattern.count(_ == '\n') >= 3 || craftPattern
          .split('\n')
          .exists(_.length >= 3)
      ) "shaped-3"
      else "shaped-2"
  }

  case class CraftingShapeless(
      id: Int,
      recipeCategory: Option[String],
      recipeGroup: Option[String],
      shapelessIngredients: Seq[Seq[Item]],
      resultItem: Item,
      resultItemAmount: Int,
      likeStatus: LikeStatus = LikeStatus.NoStatus
  ) extends Recipe {
    override def recipeType: String = "shapeless"
  }

  case class Smelting(
      id: Int,
      recipeCategory: Option[String],
      recipeGroup: Option[String],
      sourceItem: Item,
      resultItem: Item,
      resultItemAmount: Int,
      smeltTime: Int,
      smeltType: String,
      likeStatus: LikeStatus = LikeStatus.NoStatus
  ) extends Recipe {
    override def recipeType: String = "smelting"
  }

  case class StoneCutter(
      id: Int,
      recipeCategory: Option[String],
      recipeGroup: Option[String],
      resultItem: Item,
      resultItemAmount: Int,
      sourceItem: Item,
      likeStatus: LikeStatus = LikeStatus.NoStatus
  ) extends Recipe {
    override def recipeType: String = "stonecutter"
  }

  case class Other(
      id: Int,
      recipeCategory: Option[String],
      recipeGroup: Option[String],
      resultItem: Item,
      resultItemAmount: Int,
      ingredients: Map[String, Seq[Item]],
      likeStatus: LikeStatus = LikeStatus.NoStatus
  ) extends Recipe {
    override def recipeType: String = "unknown"
  }
}
