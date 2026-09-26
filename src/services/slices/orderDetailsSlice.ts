import { getOrderByNumberApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type OrderDetailsState = {
  order: TOrder | null;
  requestedNumber: number | null;
  requestId: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: OrderDetailsState = {
  order: null,
  requestedNumber: null,
  requestId: null,
  isLoading: false,
  error: null,
};

export const fetchOrderDetails = createAsyncThunk<
  TOrder | null,
  number,
  { state: { orderDetails: OrderDetailsState } }
>(
  'orderDetails/fetchOrderDetails',
  async (number) => {
    const response = await getOrderByNumberApi(number);

    if (!response.success) {
      throw new Error('Не удалось загрузить заказ');
    }

    return response.orders.find((order) => order.number === number) ?? null;
  },
  {
    condition: (number, { getState }) => {
      const details = getState().orderDetails;

      return !(details.isLoading && details.requestedNumber === number);
    },
  }
);

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state, action) => {
        state.order = null;
        state.requestedNumber = action.meta.arg;
        state.requestId = action.meta.requestId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.order = action.payload;
        state.isLoading = false;
        state.requestId = null;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить заказ';
        state.requestId = null;
      });
  },
  selectors: {
    selectOrderDetails: (state) => state,
  },
});

export const { selectOrderDetails } = orderDetailsSlice.selectors;

export default orderDetailsSlice.reducer;
