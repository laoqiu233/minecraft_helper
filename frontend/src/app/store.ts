import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { recipeSlice } from "../features/recipe/recipeSlice"
import { craftsBoardSlice } from "../features/craftsBoard/craftsBoardSlice"

export const store = configureStore({
  reducer: {
    recipes: recipeSlice.reducer,
    craftBoard: craftsBoardSlice.reducer
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
