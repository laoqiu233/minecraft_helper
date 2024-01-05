import styles from "./RecipeCard.module.css"
import { Cell } from "../Cell/Cell"
import { CraftingShapedCard, CraftingShapelessCard } from "./formats/CraftingCard"

interface RecipeTypeProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeTypeProps) {
  if (recipe.CraftingShaped) {
    return <CraftingShapedCard recipe={recipe.CraftingShaped}/>
  } else if (recipe.CraftingShapeless) {
    return <CraftingShapelessCard recipe={recipe.CraftingShapeless}/>
  } else {
    return <div>fuck you</div>
  }
}
