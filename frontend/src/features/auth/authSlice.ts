import {
  Action,
  PayloadAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "../../app/store"
import { getUserProfile } from "../../util/AuthApi"

interface AuthState {
  user?: UserProfile
  accessToken?: string
  loading: boolean
}

const initialState: AuthState = {
  user: undefined,
  accessToken: localStorage.getItem("accessToken") || undefined,
  loading: false,
}

export const fetchAuthorizedUserProfile = createAsyncThunk<
  UserProfile,
  undefined,
  {
    dispatch: AppDispatch
    state: RootState
  }
>("auth/userLoggedIn", async (arg: undefined, thunkApi) => {
  try {
    return await getUserProfile()
  } catch (error) {
    return thunkApi.rejectWithValue("failed")
  }
})

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    accessTokenUpdated: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    loggedOut: (state, action: Action) => {
      state.accessToken = undefined
      state.user = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthorizedUserProfile.pending, (state, action) => {
        state.loading = true
        state.user = undefined
      })
      .addCase(fetchAuthorizedUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(fetchAuthorizedUserProfile.rejected, (state, action) => {
        state.loading = false
        state.user = undefined
        state.accessToken = undefined
      })
  },
})

export const { accessTokenUpdated, loggedOut } = authSlice.actions
