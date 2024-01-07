import { StoneCutter } from "../../../models/Recipe";
import styles from "../RecipeCard.module.css"
import { Cell } from "../../Cell/Cell";
import { NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice";

interface StoneCutterCardProps {
    recipe: StoneCutter
    worldEntityClickCallBack?: (targetId: number, targetType: NodeTargetType) => void
}

export function StoneCutterCard({recipe, worldEntityClickCallBack}: StoneCutterCardProps) {
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
                worldEntityClickCallBack={worldEntityClickCallBack}
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