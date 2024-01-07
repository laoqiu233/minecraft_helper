import { Cell } from "../../Cell/Cell"
import styles from "../RecipeCard.module.css"
import { CraftingShaped, CraftingShapeless } from "../../../models/Recipe"
import { NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice"

interface CraftingShapedCardProps {
  recipe: CraftingShaped
  worldEntityClickCallBack?: (targetId: number, targetType: NodeTargetType) => void
}

interface CraftingShapelessCardProps {
  recipe: CraftingShapeless
  worldEntityClickCallBack?: (targetId: number, targetType: NodeTargetType) => void
}

interface CraftingCardProps {
  itemsGrid: Item[][][]
  resultItem: Item
  resultItemAmount: number
  worldEntityClickCallBack?: (targetId: number, targetType: NodeTargetType) => void
}

function CraftingCard({
  itemsGrid,
  resultItem,
  resultItemAmount,
  worldEntityClickCallBack,
}: CraftingCardProps) {
  return (
    <>
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
                <Cell
                  worldEntityClickCallBack={worldEntityClickCallBack}
                  items={items}
                  amount={1}
                  key={`${i}-${j}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.arrow} />
        <Cell
          items={[resultItem]}
          amount={resultItemAmount}
        />
      </div>
    </>
  )
}

export function CraftingShapedCard({
  recipe,
  worldEntityClickCallBack,
}: CraftingShapedCardProps) {
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
      worldEntityClickCallBack={worldEntityClickCallBack}
    />
  )
}

export function CraftingShapelessCard({
  recipe,
  worldEntityClickCallBack,
}: CraftingShapelessCardProps) {
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
      worldEntityClickCallBack={worldEntityClickCallBack}
    />
  )
}
