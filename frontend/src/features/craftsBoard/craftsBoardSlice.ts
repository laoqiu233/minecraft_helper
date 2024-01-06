import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "../../app/store"
import { ThunkAction } from 'redux-thunk'
import { fetchRecipeByIdAction } from "../recipe/recipeSlice"


export interface CraftNodes {
    [key: number]: CraftNode
}

export interface CraftNode {
    targetItemId: number,
    currentSlide: number,
    childens: number[]
}

interface CraftsBoardState {
  craftNodes: CraftNodes,
  currentNodeId: number
}

const initialState: CraftsBoardState = {
  craftNodes: {},
  currentNodeId: 0
}


export const addEntityToBoardThunk = createAsyncThunk<
  void,
  number,
  {
    dispatch: AppDispatch,
    state: RootState
  }
>('board/addEntity',async (itemId:number, thunkApi) => {
  thunkApi.dispatch(fetchRecipeByIdAction(itemId))
  thunkApi.dispatch(pasteNewRoot(itemId))
})


export const addChildEntityToBoardThunk = createAsyncThunk<
  void,
  {parentNodeId: number, childTargetItemId: number},
  {
    dispatch: AppDispatch,
    state: RootState
  }
>('board/addEntity', async (payload, thunkApi) => {
  const state = thunkApi.getState()
  const nodeChildrens = state.craftBoard.craftNodes[payload.parentNodeId].childens;
  const isAlreadyChild = nodeChildrens.map((childNodeId) => {
    return state.craftBoard.craftNodes[childNodeId].targetItemId
  }).some((targetChildItemId) => {
    return targetChildItemId == payload.childTargetItemId
  })
  if (!isAlreadyChild) {
    thunkApi.dispatch(fetchRecipeByIdAction(payload.childTargetItemId))
    thunkApi.dispatch(addChild(payload))
  }
}) 


export const craftsBoardSlice = createSlice({
  name: "craftBoard",
  initialState,
  reducers: {
    addChild: (state, action: PayloadAction<{parentNodeId: number, childTargetItemId: number}>) => {
      state.craftNodes[state.currentNodeId] = {
        targetItemId: action.payload.childTargetItemId,
        currentSlide: 0,
        childens: []
      }
      state.craftNodes[action.payload.parentNodeId].childens.push(state.currentNodeId)
      state.currentNodeId += 1
    },
    pasteNewRoot: (state, action: PayloadAction<number>) => {
      state.craftNodes = {
        0: {
          targetItemId: action.payload,
          currentSlide: 0,
          childens: []
        }
      }
      state.currentNodeId = 1
    },
    nextSlide: (state, action: PayloadAction<number>) => {
      const craftNodeId = action.payload;
      state.craftNodes[craftNodeId].currentSlide += 1

      state.craftNodes[craftNodeId].childens = []

    },
    prevSlide: (state, action: PayloadAction<number>) => {
      const craftNodeId = action.payload;
      state.craftNodes[craftNodeId].currentSlide -= 1

      state.craftNodes[craftNodeId].childens = []
    },
  }
})


export const { addChild, pasteNewRoot, nextSlide, prevSlide } = craftsBoardSlice.actions

export const selectCraftNodes = (state: RootState) => state.craftBoard.craftNodes
