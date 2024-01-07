import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "../../app/store"
import { ThunkAction } from "redux-thunk"
import { fetchRecipesByItemIdAction } from "../recipe/recipeSlice"
import { AbstractDrop } from "../../models/Drop"
import { fetchDrops } from "../../util/DropApi"

export interface CraftNodes {
  [key: number]: CraftNode
}

export type NodeTargetType = "item" | "structure" | "biome" | "mob"

export interface CraftNode {
  targetId: number
  targetType: NodeTargetType
  currentSlide: number
  children: number[]
  drop: AbstractDrop[]
}

interface CraftsBoardState {
  craftNodes: CraftNodes
  currentNodeId: number
}

const initialState: CraftsBoardState = {
  craftNodes: {},
  currentNodeId: 0,
}

export const addEntityToBoardThunk = createAsyncThunk<
  void,
  number,
  {
    dispatch: AppDispatch
    state: RootState
  }
>("board/addEntity", async (itemId: number, thunkApi) => {
  thunkApi.dispatch(fetchRecipesByItemIdAction(itemId))
  const drop: AbstractDrop[] = await fetchDrops(itemId)
  thunkApi.dispatch(pasteNewRoot({itemId: itemId, drop: drop}))
})


export const addChildEntityToBoardThunk = createAsyncThunk<
  void,
  { parentNodeId: number, childTargetId: number, childTargetType: NodeTargetType},
  {
    dispatch: AppDispatch
    state: RootState
  }
>("board/addEntity", async (payload, thunkApi) => {
  const state = thunkApi.getState()

  const nodeChildrens =
    state.craftBoard.craftNodes[payload.parentNodeId].children

  const isAlreadyChild = nodeChildrens
    .map((childNodeId) => {
      return {
        targetId: state.craftBoard.craftNodes[childNodeId].targetId,
        targetType: state.craftBoard.craftNodes[childNodeId].targetType
      }
    })
    .some(({targetId, targetType}) => {
      return targetId == payload.childTargetId && targetType == payload.childTargetType
    })

  if (!isAlreadyChild) {
    thunkApi.dispatch(fetchRecipesByItemIdAction(payload.childTargetId))
    const drop: AbstractDrop[] = await fetchDrops(payload.childTargetId)
    thunkApi.dispatch(addChild({...payload, drop: drop}))
  }

})

export const craftsBoardSlice = createSlice({
  name: "craftBoard",
  initialState,
  reducers: {
    addChild: (
      state,
      action: PayloadAction<{
        parentNodeId: number
        childTargetId: number
        childTargetType: NodeTargetType
        drop: AbstractDrop[]
      }>,
    ) => {
      state.craftNodes[state.currentNodeId] = {
        targetId: action.payload.childTargetId,
        targetType: action.payload.childTargetType,
        currentSlide: 0,
        children: [],
        drop: action.payload.drop
      }
      state.craftNodes[action.payload.parentNodeId].children.push(
        state.currentNodeId,
      )
      state.currentNodeId += 1
    },
    pasteNewRoot: (state, action: PayloadAction<{itemId: number, drop: AbstractDrop[]}>) => {
      state.craftNodes = {
        0: {
          targetId: action.payload.itemId,
          targetType: "item",
          currentSlide: 0,
          children: [],
          drop: action.payload.drop
        },
      }
      state.currentNodeId = 1
    },
    nextSlide: (state, action: PayloadAction<number>) => {
      const craftNodeId = action.payload
      state.craftNodes[craftNodeId].currentSlide += 1

      state.craftNodes[craftNodeId].children = []
    },
    prevSlide: (state, action: PayloadAction<number>) => {
      const craftNodeId = action.payload
      state.craftNodes[craftNodeId].currentSlide -= 1

      state.craftNodes[craftNodeId].children = []
    }
  },
})

export const { addChild, pasteNewRoot, nextSlide, prevSlide} =
  craftsBoardSlice.actions

export const selectCraftNodes = (state: RootState) =>
  state.craftBoard.craftNodes
