interface IngredientsMap {
  [key: string]: Item[]
}

type Recipe = {
  CraftingShaped?: CraftingShaped
  CraftingShapeless?: CraftingShapeless
  Smelting?: Smelting
  Other?: Other
}

type CraftingShaped = {
  id: number
  recipeCategory: string
  recipeGroup: string
  ingredients: IngredientsMap
  resultItem: Item
  resultItemAmount: number
  craftPattern: string
}

type CraftingShapeless = {
  id: number
  recipeCategory: string
  recipeGroup: string
  shapelessIngredients: Item[][]
  resultItem: Item
  resultItemAmount: number
}

type Smelting = {
  id: number
  recipeCategory: string
  recipeGroup: string
  sourceItem: Item
  resultItem: Item
  resultItemAmount: number
  smeltTime: number
  smeltType: "smelting" | "blasting"
}

type Other = {
  id: number
  resultItem: Item
  ingredients: IngredientsMap
  craftPatten: string
  resultItemAmount: number
}
