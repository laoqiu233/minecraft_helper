import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { fetchRecipe } from "../../util/RecipeApi"

interface RecipeState {
  recipe: RecipeUI | undefined
  loading: "idle" | "pending" | "succeeded" | "failed"
}

const initialState: RecipeState = {
  recipe: undefined,
  loading: "idle",
}

export const recipeSlice = createSlice({
  name: "recipe",
  initialState,
  reducers: {
    recipeSet: (state, action: PayloadAction<RecipeUI>) => {
      state.recipe = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchRecipeByIdAction.fulfilled,
      (state, action: PayloadAction<RecipeUI>) => {
        state.recipe = action.payload
      },
    )
  },
})

export const fetchRecipeByIdAction = createAsyncThunk(
  "recipe/fetchByIdStatus",
  async (recipeId: number, thunkApi) => {
    const recipeUI = await fetchRecipe(recipeId)
    return recipeUI
  },
)

export const { recipeSet } = recipeSlice.actions

export const selectRecipe = (state: RootState) => state.recipe.recipe
