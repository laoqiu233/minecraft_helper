import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  CraftNode,
  addChild,
  addChildEntityToBoardThunk,
  nextSlide,
  prevSlide,
} from "../../features/craftsBoard/craftsBoardSlice"
import { extractRecipe, Recipe } from "../../models/Recipe"
import { RecipeCard } from "../RecipeCard/RecipeCard"
import styles from "./CraftCard.module.css"

interface CraftCardTypeProps {
  craftNodeId: number
}

export function CraftCard({ craftNodeId }: CraftCardTypeProps) {
  const childrenNodeIds = useAppSelector(state => state.craftBoard.craftNodes[craftNodeId].children)
  const dispatch = useAppDispatch()

  const craftNode: CraftNode = useAppSelector(
    (state) => state.craftBoard.craftNodes[craftNodeId],
  )

  const recipes = useAppSelector((state) => {
    return state.recipes.recipes.filter(
      (r) => extractRecipe(r).resultItem.id == craftNode.targetItemId,
    )
  })

  const currentRecipe = recipes
    ? recipes[craftNode.currentSlide % recipes.length]
    : undefined

  function addChildNode(targetItemId: number) {
    dispatch(
      addChildEntityToBoardThunk({
        parentNodeId: craftNodeId,
        childTargetItemId: targetItemId,
      }),
    )
  }

  return (
    <div className={styles.craftCard}>
      <div className={styles.craftCardInner}>
        {0 < craftNode.currentSlide && (
          <button onClick={() => dispatch(prevSlide(craftNodeId))}>prev</button>
        )}
        {recipes && recipes.length - 1 > craftNode.currentSlide && (
          <button onClick={() => dispatch(nextSlide(craftNodeId))}>next</button>
        )}
        <RecipeCard recipe={currentRecipe} itemClickCallBack={addChildNode} />
      </div>
      { childrenNodeIds.length > 0 &&
        <div className={styles.craftCardChildren}>
          {childrenNodeIds.map((id) => <CraftCard craftNodeId={id}/>)}
        </div>
      }
    </div>
  )
}
