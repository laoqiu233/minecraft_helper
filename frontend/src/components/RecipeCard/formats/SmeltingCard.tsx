import { Cell } from "../../Cell/Cell"
import styles from "../RecipeCard.module.css"

interface SmeltingCardProps {
  recipe: Smelting
}

export function SmeltingCard({ recipe }: SmeltingCardProps) {
  return (
    <div className={styles.recipeCard}>
      <div className={styles.recipeCardHeader}>
        <span>{recipe.smeltType === "smelting" ? "Smelting" : "Blasting"}</span>
        <img
          src={
            recipe.smeltType === "smelting"
              ? "images/items/minecraft_furnace.png"
              : "images/items/minecraft_blast_furnace.png"
          }
          className="sharp-image"
        />
      </div>
      <div className={styles.recipeCardInner}>
        <Cell items={[recipe.sourceItem]} amount={1} />
        <div className={styles.arrow} />
        <Cell items={[recipe.resultItem]} amount={1} />
      </div>
      <div className={styles.recipeCardFooter}>
        <span>Smelting time: {recipe.smeltTime} ticks</span>
      </div>
    </div>
  )
}
