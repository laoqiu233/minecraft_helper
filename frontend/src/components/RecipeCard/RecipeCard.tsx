import styles from "./RecipeCard.module.css"
import { Cell } from "../Cell/Cell"
import {
  CraftingShapedCard,
  CraftingShapelessCard,
} from "./formats/CraftingCard"
import { SmeltingCard } from "./formats/SmeltingCard"
import { useAppSelector } from "../../app/hooks"

interface RecipeTypeProps {
  recipeId: number
}

export function RecipeCard({ recipeId }: RecipeTypeProps) {
  const recipe: Recipe = useAppSelector((state) => {
    return state.recipes.recipes[recipeId];
  })
  if (!recipe) {
    return <p>fuck you</p>
  } else if (recipe.CraftingShaped) {
    return <CraftingShapedCard recipe={recipe.CraftingShaped} />
  } else if (recipe.CraftingShapeless) {
    return <CraftingShapelessCard recipe={recipe.CraftingShapeless} />
  } else if (recipe.Smelting) {
    return <SmeltingCard recipe={recipe.Smelting} />
  } else {
    return <p>fuck you</p>
  }
}
