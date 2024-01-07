import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  CraftNode,
  addChildEntityToBoardThunk,
  nextSlide,
  prevSlide,
} from "../../features/craftsBoard/craftsBoardSlice"
import { AbstractDrop } from "../../models/Drop"
import { extractRecipe, Recipe } from "../../models/Recipe"
import { DropCard } from "../DropCard/DropCard"
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

  const drops: AbstractDrop[] = craftNode.drop;

  const currentSlide = craftNode.currentSlide
  const slidesLength = recipes.length + drops.length;

  const prevArrowFlag = 0 < craftNode.currentSlide;
  const nextArrowFlag = slidesLength - 1 > currentSlide;

  let currentRecipe = undefined;
  let currentDrop = undefined;

  if (craftNode.currentSlide < recipes.length) {
    currentRecipe = recipes[currentSlide]
  } else {
    currentDrop = drops[currentSlide - recipes.length]
  }

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
        <div className="minecraft-card">
          {(prevArrowFlag || nextArrowFlag) && <div className={styles.arrowsContainer}>
            {prevArrowFlag && (
              <button onClick={() => dispatch(prevSlide(craftNodeId))} className={styles.arrowPrev}></button>
            )}
            {nextArrowFlag && (
              <button onClick={() => dispatch(nextSlide(craftNodeId))} className={styles.arrowNext}></button>
            )}
          </div>}
          {currentRecipe && <RecipeCard recipe={currentRecipe} itemClickCallBack={addChildNode} />}
          {currentDrop && <DropCard drop={currentDrop} />}
          {!currentDrop && !currentRecipe && "Fuck You!"}
        </div>
      </div>
      { childrenNodeIds.length > 0 &&
        <div className={styles.craftCardChildren}>
          {childrenNodeIds.map((id) => <CraftCard craftNodeId={id}/>)}
        </div>
      }
    </div>
  )
}
