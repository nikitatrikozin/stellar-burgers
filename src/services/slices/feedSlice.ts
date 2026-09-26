import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type FeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
};

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  isLoaded: false,
  error: null,
};

export const fetchFeed = createAsyncThunk<
  Awaited<ReturnType<typeof getFeedsApi>>,
  void,
  { state: { feed: FeedState } }
>('feed/fetchFeed', async () => getFeedsApi(), {
  condition: (_, { getState }) => {
    return !getState().feed.isLoading;
  },
});

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
        state.isLoading = false;
        state.isLoaded = true;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ленту';
      });
  },
  selectors: {
    selectFeed: (state) => state,
  },
});

export const { selectFeed } = feedSlice.selectors;

export default feedSlice.reducer;
