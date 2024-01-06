interface IngredientsMap {
  [key: string]: Item[]
}

export type LikeStatus = "like" | "dislike" | "no_status"

export type Recipe = {
  CraftingShaped?: CraftingShaped
  CraftingShapeless?: CraftingShapeless
  Smelting?: Smelting
  Other?: Other
}

export type BaseRecipe = {
  id: number
  resultItem: Item
  resultItemAmount: number
  recipeCategory: string
  recipeGroup: string
  likeStatus: LikeStatus
}

export type CraftingShaped = {
  ingredients: IngredientsMap
  craftPattern: string
} & BaseRecipe

export type CraftingShapeless = {
  shapelessIngredients: Item[][]
  resultItem: Item
  resultItemAmount: number
} & BaseRecipe

export type Smelting = {
  sourceItem: Item
  smeltTime: number
  smeltType: "smelting" | "blasting"
} & BaseRecipe

export type Other = {
  ingredients: IngredientsMap
} & BaseRecipe

export function extractRecipe(recipe: Recipe): BaseRecipe {
  const baseRecipe =
    recipe.CraftingShaped ||
    recipe.CraftingShapeless ||
    recipe.Smelting ||
    recipe.Other

  if (baseRecipe === undefined)
    throw new Error("Empty recipe, this should not happen")

  return baseRecipe
}
