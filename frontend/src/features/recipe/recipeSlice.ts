import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { fetchRecipe, parseId } from "../../util/RecipeApi"



interface RecipesState {
  recipes: RecipesMap
  loading: "idle" | "pending" | "succeeded" | "failed"
}

interface RecipesMap {
  [key: number]: Recipe
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
      (state, action: PayloadAction<Recipe>) => {
        let id = parseId(action.payload)
        state.recipes[action.payload.id] = (action.payload)
      },
    )
  },
})

export const fetchRecipeByIdAction = createAsyncThunk(
  "recipe/fetchByIdStatus",
  async (recipeId: number, thunkApi) => {
    const recipe = await fetchRecipe(recipeId)
    return recipe
  },
)
