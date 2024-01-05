import { Cell } from "../../Cell/Cell"
import styles from "../RecipeCard.module.css"

interface CraftingShapedCardProps {
    recipe: CraftingShaped
}

export function CraftingShapedCard({recipe}: CraftingShapedCardProps) {
    const pattern = recipe.craftPattern.split('\n').map((v) => v.split(''))
    const gridSize = Math.max(pattern.length, pattern.reduce((prev, curr) => Math.max(prev, curr.length), 0), 2)
    const itemsGrid = Array.from({length: gridSize}, e => Array.from({length: gridSize}, e => Array<Item>(0)))

    pattern.forEach((row, i) => row.forEach((key, j) => {
        itemsGrid[i][j] = recipe.ingredients[key]
    }))

    return (
        <div className={styles.recipeCard}>
            <div>
                {itemsGrid.map((row, i) => <div key={i}>
                    {row.map((items, j) => <Cell items={items} amount={1} key={`${i}-${j}`}/>)}
                </div>)}
            </div>
            <div className={styles.arrow}/>
            <Cell items={[recipe.resultItem]} amount={recipe.resultItemAmount}/>
        </div>
    )
}