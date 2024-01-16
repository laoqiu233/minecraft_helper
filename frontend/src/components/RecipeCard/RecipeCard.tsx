import styles from "./RecipeCard.module.css"
import {
  CraftingShapedCard,
  CraftingShapelessCard,
} from "./formats/CraftingCard"
import { SmeltingCard } from "./formats/SmeltingCard"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { likeRecipeByIdAction } from "../../features/recipe/recipeSlice"
import { Recipe, extractRecipe } from "../../models/Recipe"
import { Tooltip } from "../Tooltip/Tooltip"
import { StoneCutterCard } from "./formats/StoneCutterCard"
import { NodeTargetType } from "../../features/craftsBoard/craftsBoardSlice"

interface RecipeTypeProps {
  recipe?: Recipe
  worldEntityClickCallBack?: (targetId: number, targetType: NodeTargetType) => void
}

function chooseRecipeCard(
  recipe?: Recipe,
  worldEntityClickCallBack?: (targetId: number, targetType: NodeTargetType) => void,
) {
  if (!recipe) {
    return <p>Recipe not available</p>
  } else if (recipe.CraftingShaped) {
    return (
      <CraftingShapedCard
        recipe={recipe.CraftingShaped}
        worldEntityClickCallBack={worldEntityClickCallBack}
      />
    )
  } else if (recipe.CraftingShapeless) {
    return (
      <CraftingShapelessCard
        recipe={recipe.CraftingShapeless}
        worldEntityClickCallBack={worldEntityClickCallBack}
      />
    )
  } else if (recipe.Smelting) {
    return (
      <SmeltingCard
        recipe={recipe.Smelting}
        worldEntityClickCallBack={worldEntityClickCallBack}
      />
    )
  } else if (recipe.StoneCutter) {
    return (
      <StoneCutterCard
        recipe={recipe.StoneCutter}
        worldEntityClickCallBack={worldEntityClickCallBack}
      />
    )
  } else {
    return <p>Unkown recipe type</p>
  }
}

function LikeButtons(recipe?: Recipe) {
  const dispatch = useAppDispatch()

  if (recipe) {
    const baseRecipe = extractRecipe(recipe)

    return (
      <>
        <Tooltip tip="Like">
          <button
            className={
              styles.likeButton +
              " " +
              (baseRecipe.likeStatus === "like" ? styles.likeButtonPressed : "")
            }
            onClick={() => {
              const newStatus =
                baseRecipe.likeStatus === "like" ? "no_status" : "like"
              dispatch(
                likeRecipeByIdAction({
                  recipeId: baseRecipe.id,
                  likeStatus: newStatus,
                }),
              )
            }}
          >
            <img
              src={
                baseRecipe.likeStatus === "like"
                  ? "images/like_clicked.gif"
                  : "images/like.png"
              }
              width="16px"
              className="sharp-image"
            />
          </button>
        </Tooltip>
        <Tooltip tip="Dislike">
          <button
            className={
              styles.likeButton +
              " " +
              (baseRecipe.likeStatus === "dislike"
                ? styles.likeButtonPressed
                : "")
            }
            onClick={() => {
              const newStatus =
                baseRecipe.likeStatus === "dislike" ? "no_status" : "dislike"
              dispatch(
                likeRecipeByIdAction({
                  recipeId: baseRecipe.id,
                  likeStatus: newStatus,
                }),
              )
            }}
          >
            <img
              src={
                baseRecipe.likeStatus === "dislike"
                  ? "images/dislike_clicked.gif"
                  : "images/dislike.png"
              }
              width="20px"
              className="sharp-image"
            />
          </button>
        </Tooltip>
      </>
    )
  }

  return null
}

export function RecipeCard({ recipe, worldEntityClickCallBack }: RecipeTypeProps) {
  const card = chooseRecipeCard(recipe, worldEntityClickCallBack)
  const likeButtons = LikeButtons(recipe)
  const userLoggedIn = useAppSelector((state) => state.auth.user !== undefined)

  return (
    <div>
      {card}
      {userLoggedIn && (
        <div className={styles.likeButtonGroup}>{likeButtons}</div>
      )}
    </div>
  )
}
