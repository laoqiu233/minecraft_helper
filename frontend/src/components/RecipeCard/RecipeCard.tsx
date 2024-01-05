import styles from "./RecipeCard.module.css"
import { Cell } from "../Cell/Cell"
import { CraftingShapedCard } from "./formats/CraftingShapedCard"

interface RecipeTypeProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeTypeProps) {
  if (recipe.CraftingShaped) {
    return <CraftingShapedCard recipe={recipe.CraftingShaped}/>
  } else {
    return <div>fuck you</div>
  }
}
