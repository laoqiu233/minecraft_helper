import styles from "./RecipeCard.module.css"
import { Cell } from "./Cell"

interface RecipeTypeProps {
    recipe: RecipeUI
}

export function RecipeCard({recipe}: RecipeTypeProps) {

        let recipeBoard = recipe.ingridients.map((items, index) => {
            return <Cell items={items} /> 
        })
        return (
            <div className={styles.mcui_recipe_card}>
                <div className={styles.mcui_recipe_board}>{recipeBoard}</div>
                <div className={styles.mcui_arrow}></div>
                <Cell items={[recipe.resultItem]} />
            </div>
        )

}