import { Cell } from "../../Cell/Cell"
import styles from "../RecipeCard.module.css"

interface CraftingShapedCardProps {
  recipe: CraftingShaped
}

interface CraftingShapelessCardProps {
  recipe: CraftingShapeless
}

interface CraftingCardProps {
  itemsGrid: Item[][][]
  resultItem: Item
  resultItemAmount: number
}

function CraftingCard({
  itemsGrid,
  resultItem,
  resultItemAmount,
}: CraftingCardProps) {
  return (
    <div className={styles.recipeCard}>
      <div className={styles.recipeCardHeader}>
        <span>Crafting</span>
        <img
          src="images/items/minecraft_crafting_table.png"
          className="sharp-image"
        />
      </div>
      <div className={styles.recipeCardInner}>
        <div>
          {itemsGrid.map((row, i) => (
            <div key={i}>
              {row.map((items, j) => (
                <Cell items={items} amount={1} key={`${i}-${j}`} />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.arrow} />
        <Cell items={[resultItem]} amount={resultItemAmount} />
      </div>
    </div>
  )
}

export function CraftingShapedCard({ recipe }: CraftingShapedCardProps) {
  const pattern = recipe.craftPattern.split("\n").map((v) => v.split(""))
  const gridSize = Math.max(
    pattern.length,
    pattern.reduce((prev, curr) => Math.max(prev, curr.length), 0),
    2,
  )
  const itemsGrid = Array.from({ length: gridSize }, (e) =>
    Array.from({ length: gridSize }, (e) => Array<Item>(0)),
  )

  pattern.forEach((row, i) =>
    row.forEach((key, j) => {
      if (key !== " ") {
        itemsGrid[i][j] = recipe.ingredients[key]
      }
    }),
  )

  return (
    <CraftingCard
      itemsGrid={itemsGrid}
      resultItem={recipe.resultItem}
      resultItemAmount={recipe.resultItemAmount}
    />
  )
}

export function CraftingShapelessCard({ recipe }: CraftingShapelessCardProps) {
  const gridSize = recipe.shapelessIngredients.length > 4 ? 3 : 2
  const itemsGrid = Array.from({ length: gridSize }, (e) =>
    Array.from({ length: gridSize }, (e) => Array<Item>(0)),
  )

  recipe.shapelessIngredients.forEach((items, i) => {
    itemsGrid[Math.floor(i / gridSize)][i % gridSize] = items
  })

  return (
    <CraftingCard
      itemsGrid={itemsGrid}
      resultItem={recipe.resultItem}
      resultItemAmount={recipe.resultItemAmount}
    />
  )
}
