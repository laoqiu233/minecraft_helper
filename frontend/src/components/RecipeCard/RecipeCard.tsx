import styles from "./RecipeCard.module.css"
import { Cell } from "../Cell/Cell"
import {
  CraftingShapedCard,
  CraftingShapelessCard,
} from "./formats/CraftingCard"
import { SmeltingCard } from "./formats/SmeltingCard"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { likeRecipeByIdAction } from "../../features/recipe/recipeSlice"
import {Recipe, extractRecipe} from "../../models/Recipe"

interface RecipeTypeProps {
  recipe: Recipe,
  itemClickCallBack: (targetItemId: number) => void
}

function chooseRecipeCard(recipe: Recipe, itemClickCallBack: (targetItemId: number) => void) {
  if (!recipe) {
    return <p>fuck you1</p>
  } else if (recipe.CraftingShaped) {
    return <CraftingShapedCard recipe={recipe.CraftingShaped} itemClickCallBack={itemClickCallBack} />
  } else if (recipe.CraftingShapeless) {
    return <CraftingShapelessCard recipe={recipe.CraftingShapeless} itemClickCallBack={itemClickCallBack} />
  } else if (recipe.Smelting) {
    return <SmeltingCard  recipe={recipe.Smelting} itemClickCallBack={itemClickCallBack}/>
  } else {
    return <p>fuck you2</p>
  }
}

function LikeButtons(recipe?: Recipe) {
  const userLoggedIn = useAppSelector(state => state.auth.user !== undefined)
  const dispatch = useAppDispatch()

  if (recipe) {
    const baseRecipe = extractRecipe(recipe)

    return (
      <>
        <button className={styles.likeButton} disabled={!userLoggedIn} onClick={() => {
          const newStatus = baseRecipe.likeStatus == "like" ? "no_status" : "like"
          dispatch(likeRecipeByIdAction({recipeId: baseRecipe.id, likeStatus: newStatus}))
        }}>
          <img src="images/heart.png" width="16px" className="sharp-image"/>
          <img src="images/glint.png" className={styles.glint}/>
        </button>
        <button className={styles.likeButton} disabled={!userLoggedIn} onClick={() => {
          const newStatus = baseRecipe.likeStatus == "dislike" ? "no_status" : "dislike"
          dispatch(likeRecipeByIdAction({recipeId: baseRecipe.id, likeStatus: newStatus}))
        }}>
          <img src="images/dislike.png" width="20px" className="sharp-image"/>
        </button>
      </>
    )
  }

  return null
}

export function RecipeCard({ recipe, itemClickCallBack }: RecipeTypeProps) {
  const card = chooseRecipeCard(recipe, itemClickCallBack)
  const likeButtons = LikeButtons(recipe)
  const likeStatus = recipe ? extractRecipe(recipe).likeStatus : null

  return (
    <div className="minecraft-card">
      {card}
      {likeButtons}
      {likeStatus}
    </div>
  )
}
