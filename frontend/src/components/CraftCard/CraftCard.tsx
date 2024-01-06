import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { CraftNode, addChild, addChildEntityToBoardThunk, nextSlide, prevSlide } from "../../features/craftsBoard/craftsBoardSlice"
import { RecipeCard } from "../RecipeCard/RecipeCard"
import styles from "./CraftCard.module.css"

interface CraftCardTypeProps {
    craftNodeId: number
}

export function CraftCard({ craftNodeId }: CraftCardTypeProps) {

    const dispatch = useAppDispatch()

    const craftNode: CraftNode = useAppSelector((state) => 
        state.craftBoard.craftNodes[craftNodeId]
    )

    const recipes: Recipe[] = useAppSelector((state) => {
        return state.recipes.recipes[craftNode.targetItemId];
    })
    
    const currentRecipe = recipes ? recipes[craftNode.currentSlide % recipes.length]: undefined

    function addChildNode (targetItemId: number)  {
        dispatch(addChildEntityToBoardThunk({parentNodeId: craftNodeId, childTargetItemId: targetItemId}))
    }

    return (
        <div className={styles.craftCard}>
            <button
                onClick={() => dispatch(prevSlide(craftNodeId))}
            >
                prev
            </button>
            <button
                onClick={() => dispatch(nextSlide(craftNodeId))}
            >
                next
            </button>
            <RecipeCard recipe={currentRecipe} itemClickCallBack={addChildNode}/>
        </div>
    )
}