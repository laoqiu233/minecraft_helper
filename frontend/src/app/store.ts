import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { recipeSlice } from "../features/recipe/recipeSlice"
import { craftsBoardSlice } from "../features/craftsBoard/craftsBoardSlice"
import { authSlice } from "../features/auth/authSlice"

export const store = configureStore({
  reducer: {
    recipes: recipeSlice.reducer,
    craftBoard: craftsBoardSlice.reducer,
    auth: authSlice.reducer
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
