import { orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchFeed } from './feedSlice';
import { fetchProfileOrders } from './profileOrdersSlice';

import type { AppDispatch } from '@services/store';
import type { TOrder } from '@utils-types';

type OrderState = {
  order: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: OrderState = {
  order: null,
  isLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk<
  TOrder,
  string[],
  {
    state: { order: OrderState };
    dispatch: AppDispatch;
  }
>(
  'order/createOrder',
  async (ingredients, { dispatch }): Promise<TOrder> => {
    const response = await orderBurgerApi(ingredients);

    void dispatch(fetchFeed());
    void dispatch(fetchProfileOrders());

    return response.order;
  },
  {
    condition: (_, { getState }) => {
      return !getState().order.isLoading;
    },
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.order = null;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось оформить заказ';
      });
  },
  selectors: {
    selectCreatedOrder: (state) => state.order,
    selectOrderRequest: (state) => state.isLoading,
    selectOrderError: (state) => state.error,
  },
});

export const { clearOrder } = orderSlice.actions;

export const { selectCreatedOrder, selectOrderRequest, selectOrderError } =
  orderSlice.selectors;

export default orderSlice.reducer;
