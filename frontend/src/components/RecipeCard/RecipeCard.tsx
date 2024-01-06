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

interface RecipeTypeProps {
  recipe: Recipe
  itemClickCallBack: (targetItemId: number) => void
}

function chooseRecipeCard(
  recipe: Recipe,
  itemClickCallBack: (targetItemId: number) => void,
) {
  if (!recipe) {
    return <p>fuck you1</p>
  } else if (recipe.CraftingShaped) {
    return (
      <CraftingShapedCard
        recipe={recipe.CraftingShaped}
        itemClickCallBack={itemClickCallBack}
      />
    )
  } else if (recipe.CraftingShapeless) {
    return (
      <CraftingShapelessCard
        recipe={recipe.CraftingShapeless}
        itemClickCallBack={itemClickCallBack}
      />
    )
  } else if (recipe.Smelting) {
    return (
      <SmeltingCard
        recipe={recipe.Smelting}
        itemClickCallBack={itemClickCallBack}
      />
    )
  } else {
    return <p>fuck you2</p>
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

export function RecipeCard({ recipe, itemClickCallBack }: RecipeTypeProps) {
  const card = chooseRecipeCard(recipe, itemClickCallBack)
  const likeButtons = LikeButtons(recipe)
  const userLoggedIn = useAppSelector((state) => state.auth.user !== undefined)

  return (
    <div className="minecraft-card">
      {card}
      {userLoggedIn && (
        <div className={styles.likeButtonGroup}>{likeButtons}</div>
      )}
    </div>
  )
}
