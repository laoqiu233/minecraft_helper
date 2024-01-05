import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "../../app/store"
import { ThunkAction } from 'redux-thunk'
import { fetchRecipeByIdAction } from "../recipe/recipeSlice"


export interface CraftNodes {
    [key: number]: CraftNode
}

export interface CraftNode {
    recipeId: number,
    childens: number[]
}

interface CraftsBoardState {
  craftNodes: CraftNodes
}

const initialState: CraftsBoardState = {
  craftNodes: {},
}

export const addEntityToBoardThunk = createAsyncThunk<
  void,
  number,
  {
    dispatch: AppDispatch,
    state: RootState
  }
>('board/addEntity',async (recipeId:number, thunkApi) => {
  thunkApi.dispatch(fetchRecipeByIdAction(recipeId))
  thunkApi.dispatch(pasteNewRoot(recipeId))
}) 

export const craftsBoardSlice = createSlice({
  name: "craftBoard",
  initialState,
  reducers: {
    addChild: (state, action: PayloadAction<{parentId: number, childId: number}>) => {
      state.craftNodes[action.payload.parentId].childens.push(action.payload.childId)
    },
    pasteNewRoot: (state, action: PayloadAction<number>) => {
      state.craftNodes = {
        0: {recipeId: action.payload, childens: []}
      }
    }
  }
})

export const { addChild, pasteNewRoot } = craftsBoardSlice.actions

export const selectCraftNodes = (state: RootState) => state.craftBoard.craftNodes
