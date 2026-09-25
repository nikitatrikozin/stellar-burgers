import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { logoutUser } from './userSlice';

import type { TOrder } from '@utils-types';

type ProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  requestId: string | null;
};

const initialState: ProfileOrdersState = {
  orders: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  requestId: null,
};

export const fetchProfileOrders = createAsyncThunk<
  TOrder[],
  void,
  { state: { profileOrders: ProfileOrdersState } }
>('profileOrders/fetchProfileOrders', async () => getOrdersApi(), {
  condition: (_, { getState }) => {
    return !getState().profileOrders.isLoading;
  },
});

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.orders = [...action.payload].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        state.isLoading = false;
        state.isLoaded = true;
        state.requestId = null;
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить историю';
        state.requestId = null;
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
  selectors: {
    selectProfileOrders: (state) => state,
  },
});

export const { selectProfileOrders } = profileOrdersSlice.selectors;

export default profileOrdersSlice.reducer;
