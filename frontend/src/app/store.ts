import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { recipeSlice } from "../features/recipe/recipeSlice"

export const store = configureStore({
  reducer: {
    recipe: recipeSlice.reducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
