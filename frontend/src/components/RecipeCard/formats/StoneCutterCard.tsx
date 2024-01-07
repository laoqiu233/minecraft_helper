import { StoneCutter } from "../../../models/Recipe";
import styles from "../RecipeCard.module.css"
import { Cell } from "../../Cell/Cell";

interface StoneCutterCardProps {
    recipe: StoneCutter
    itemClickCallBack?: (targetItemId: number) => void
}

export function StoneCutterCard({recipe, itemClickCallBack}: StoneCutterCardProps) {
    return (
        <>
            <div className={styles.recipeCardHeader}>
                <span>Stone Cutting</span>
                <img
                src="images/stonecutter.webp"
                className="sharp-image"
                style={{width: "32px"}}
                />
            </div>
            <div className={styles.recipeCardInner}>
                <Cell
                itemClickCallBack={itemClickCallBack}
                items={[recipe.sourceItem]}
                amount={1}
                />
                <div className={styles.arrow} />
                <Cell
                items={[recipe.resultItem]}
                amount={1}
                />
            </div>
        </>
    )
}