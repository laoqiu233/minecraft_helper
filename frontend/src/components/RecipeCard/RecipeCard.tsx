import styles from "./RecipeCard.module.css"
import { Cell } from "../Cell/Cell"

interface RecipeTypeProps {
  recipe: RecipeUI
}

export function RecipeCard({ recipe }: RecipeTypeProps) {
  let recipeBoard = recipe.ingridients.map((items, index) => {
    return <Cell items={items} />
  })
  return (
    <div className={styles.mcuiRecipeCard}>
      <div className={styles.mcuiRecipeBoard}>{recipeBoard}</div>
      <div className={styles.mcuiArrow}></div>
      <Cell items={[recipe.resultItem]} />
    </div>
  )
}
