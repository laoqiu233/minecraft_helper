import apiClient from "../API"
import { Recipe, LikeStatus } from "../models/Recipe"

export function parseId(recipe: Recipe): number {
  if (recipe.CraftingShaped) {
    return recipe.CraftingShaped.id
  } else if (recipe.CraftingShapeless) {
    return recipe.CraftingShapeless.id
  } else if (recipe.Other) {
    return recipe.Other.id
  } else if (recipe.Smelting) {
    return recipe.Smelting.id
  }
  throw new Error("Unknown recipe type")
}

export async function fetchRecipe(recipeId: number): Promise<Recipe> {
  let res = await apiClient.get<Recipe>(`/recipes/${recipeId}`)
  return res.data
}

export async function fetchRecipes(targetItemId: number): Promise<Recipe[]> {
  let res = await apiClient.get(`/items/${targetItemId}/recipes`)
  let recipes: Recipe[] = res.data
  return recipes
}

export async function fetchAllItems(): Promise<Item[]> {
  let res = await apiClient.get(`/items`)
  let result: Item[] = res.data
  return result
}

export async function likeRecipe(recipeId: number, likeStatus: LikeStatus): Promise<void> {
  let response = await apiClient.patch(`/recipes/${recipeId}/like`, {
    "status": likeStatus
  })
}