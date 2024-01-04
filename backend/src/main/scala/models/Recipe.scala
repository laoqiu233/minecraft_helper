package io.dmtri.minecraft
package models

sealed trait Recipe {
  def id: Int
  def recipeType: String
  def recipeCategory: Option[String]
  def recipeGroup: Option[String]
  def ingredients: Map[String, Seq[Item]]
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
      craftPattern: String
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
        resultItemAmount: Int
                              ) extends Recipe {
    override def recipeType: String = "shapeless"

    override def ingredients: Map[String, Seq[Item]] = shapelessIngredients
      .zipWithIndex.map(ings => s"SHAPELESS-${ings._2}" -> ings._1).toMap
  }

  case class Smelting(
      id: Int,
      recipeCategory: Option[String],
      recipeGroup: Option[String],
      sourceItem: Item,
      resultItem: Item,
      resultItemAmount: Int,
      smeltTime: Int,
      smeltType: String
  ) extends Recipe {
    override def ingredients: Map[String, Seq[Item]] = Map("SMELT" -> Seq(sourceItem))

    override def recipeType: String = "smelting"
  }

  case class Other(
                    id: Int,
                    recipeCategory: Option[String],
                    recipeGroup: Option[String],
                    resultItem: Item,
                    resultItemAmount: Int,
                    ingredients: Map[String, Seq[Item]],
                  ) extends Recipe {
    override def recipeType: String = "unknown"
  }
}
