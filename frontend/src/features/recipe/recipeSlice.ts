import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { fetchRecipes, parseId } from "../../util/RecipeApi"



interface RecipesState {
  recipes: RecipesMap
  loading: "idle" | "pending" | "succeeded" | "failed"
}

interface RecipesMap {
  [key: number]: Recipe[] // key is targetItemId
}

const initialState: RecipesState = {
  recipes: {},
  loading: "idle",
}

export const recipeSlice = createSlice({
  name: "recipe",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchRecipeByIdAction.fulfilled,
      (state, action: PayloadAction<{targetItemId: number, recipes: Recipe[]}>) => {
        state.recipes[action.payload.targetItemId] = action.payload.recipes
      },
    )
  },
})

export const fetchRecipeByIdAction = createAsyncThunk(
  "recipe/fetchByIdStatus",
  async (targetItemId: number, thunkApi) => {
    const recipes = await fetchRecipes(targetItemId)
    return {targetItemId, recipes}
  },
)
