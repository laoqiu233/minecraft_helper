import apiClient from "../API"

function parseRecipeType(recipe: Recipe): string {
  if (recipe.CraftingShaped) {
    return "shaped"
  } else if (recipe.CraftingShapeless) {
    return "shapeless"
  } else if (recipe.Other) {
    return "other"
  } else if (recipe.Smelting) {
    return "smelting"
  }
  throw new Error("Unknown recipe type")
}

function parseIngridients(recipe: Recipe): Item[][] {
  let result: Item[][] = [[], [], [], [], [], [], [], [], []]

  if (recipe.CraftingShaped) {
    let pattern: string = recipe.CraftingShaped.craftPattern
    let ingredientsMap: IngredientsMap = recipe.CraftingShaped.ingredients

    let currentIndex = 0

    for (let patternSym of pattern) {
      if (patternSym === " ") {
        currentIndex++
        continue
      } else if (patternSym === "\n") {
        currentIndex = Math.ceil(currentIndex / 3) * 3
      } else {
        result[currentIndex] = ingredientsMap[patternSym]
        currentIndex++
      }
    }
  }

  if (recipe.Smelting) {
    result = [[recipe.Smelting.sourceItem]]
  }

  if (recipe.CraftingShapeless) {
    let shapelessIngredients: Item[][] =
      recipe.CraftingShapeless.shapelessIngredients

    for (let i = 0; i < shapelessIngredients.length; i++) {
      result[i] = shapelessIngredients[i]
    }
  }

  if (recipe.Other) {
    // Да ебать его нахуй в рот вообще
  }

  return result
}
function parseResultItem(recipe: Recipe): Item {
  if (recipe.CraftingShaped) {
    return recipe.CraftingShaped.resultItem
  } else if (recipe.CraftingShapeless) {
    return recipe.CraftingShapeless.resultItem
  } else if (recipe.Other) {
    return recipe.Other.resultItem
  } else if (recipe.Smelting) {
    return recipe.Smelting.resultItem
  }
  throw new Error("Unknown recipe type")
}

function parseResultAmount(recipe: Recipe): number | undefined {
  if (recipe.CraftingShaped) {
    return recipe.CraftingShaped.resultItemAmount
  } else if (recipe.CraftingShapeless) {
    return recipe.CraftingShapeless.resultItemAmount
  } else if (recipe.Other) {
    return recipe.Other.resultItemAmount
  } else if (recipe.Smelting) {
    return recipe.Smelting.resultItemAmount
  }
  throw new Error("Unknown recipe type")
}

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

export async function fetchRecipe(id: number): Promise<Recipe> {
  let res = await apiClient.get(`/recipes/${id}`)
  let recipe: Recipe = res.data

  return recipe
}

export async function fetchAllItems(): Promise<Item[]> {
  let res = await apiClient.get(`/items`)
  let result: Item[] = res.data
  return result
}
