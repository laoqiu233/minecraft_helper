import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { CraftNode, NodeTargetType, nextSlide, prevSlide } from "../../../features/craftsBoard/craftsBoardSlice"
import { AbstractDrop } from "../../../models/Drop"
import { extractRecipe } from "../../../models/Recipe"
import { DropCard } from "../../DropCard/DropCard"
import { RecipeCard } from "../../RecipeCard/RecipeCard"
import styles from "../CraftCard.module.css"

interface ItemCardProps {
  craftNodeId: number
  worldEntityClickCallBack: (targetId: number, targetType: NodeTargetType) => void
}

export function ItemCard({ craftNodeId, worldEntityClickCallBack }: ItemCardProps) {
    const dispatch = useAppDispatch()

    const craftNode: CraftNode = useAppSelector(
      (state) => state.craftBoard.craftNodes[craftNodeId],
    )

    const recipes = useAppSelector((state) => {
      return state.recipes.recipes.filter(
        (r) => extractRecipe(r).resultItem.id == craftNode.targetId,
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

    return (
      <div className="minecraft-card">
        {(prevArrowFlag || nextArrowFlag) && <div className={styles.arrowsContainer}>
          {prevArrowFlag && (
            <button onClick={() => dispatch(prevSlide(craftNodeId))} className={styles.arrowPrev}></button>
          )}
          {nextArrowFlag && (
            <button onClick={() => dispatch(nextSlide(craftNodeId))} className={styles.arrowNext}></button>
          )}
        </div>}
        {currentRecipe && <RecipeCard recipe={currentRecipe} worldEntityClickCallBack={worldEntityClickCallBack} />}
        {currentDrop && <DropCard drop={currentDrop} worldEntityClickCallBack={worldEntityClickCallBack}/>}
        {!currentDrop && !currentRecipe && "Recipe not available"}
      </div>
    )
  }