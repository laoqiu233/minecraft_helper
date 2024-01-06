import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { fetchRecipes, likeRecipe, fetchRecipe } from "../../util/RecipeApi"
import { LikeStatus, Recipe, extractRecipe } from "../../models/Recipe"
import { loggedOut } from "../auth/authSlice"

interface RecipesState {
  recipes: Recipe[]
  loading: "idle" | "pending" | "succeeded" | "failed"
}

const initialState: RecipesState = {
  recipes: [],
  loading: "idle",
}

export const recipeSlice = createSlice({
  name: "recipe",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchRecipeByIdAction.fulfilled,
        (
          state,
          action: PayloadAction<{ targetItemId: number; recipes: Recipe[] }>,
        ) => {
          state.recipes = state.recipes
            .filter(
              (r) =>
                extractRecipe(r).resultItem.id !== action.payload.targetItemId,
            )
            .concat(action.payload.recipes)
        },
      )
      .addCase(
        likeRecipeByIdAction.fulfilled,
        (state, action: PayloadAction<Recipe>) => {
          const recipe = extractRecipe(action.payload)
          const recipeIndex = state.recipes.findIndex(
            (r) => extractRecipe(r).id == recipe.id,
          )
          state.recipes[recipeIndex] = action.payload
        },
      )
      .addCase(loggedOut, (state, action) => {
        state.recipes.forEach(
          (r) => (extractRecipe(r).likeStatus = "no_status"),
        )
      })
  },
})

export const fetchRecipeByIdAction = createAsyncThunk(
  "recipe/fetchByIdStatus",
  async (targetItemId: number, thunkApi) => {
    const recipes = await fetchRecipes(targetItemId)
    return { targetItemId, recipes }
  },
)

interface LikeRecipeData {
  recipeId: number
  likeStatus: LikeStatus
}

export const likeRecipeByIdAction = createAsyncThunk(
  "recipe/recipeLiked",
  async ({ recipeId, likeStatus }: LikeRecipeData, thunkApi) => {
    await likeRecipe(recipeId, likeStatus)
    return await fetchRecipe(recipeId)
  },
)
