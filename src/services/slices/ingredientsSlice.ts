import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

type IngredientsState = {
  items: TIngredient[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: IngredientsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { state: { ingredients: IngredientsState } }
>('ingredients/fetchIngredients', async () => getIngredientsApi(), {
  condition: (_, { getState }) => {
    const { status } = getState().ingredients;

    return status === 'idle' || status === 'failed';
  },
});

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
      });
  },
  selectors: {
    selectIngredients: (state) => state.items,
    selectIngredientsStatus: (state) => state.status,
    selectIngredientsError: (state) => state.error,
  },
});

export const { selectIngredients, selectIngredientsStatus, selectIngredientsError } =
  ingredientsSlice.selectors;

export default ingredientsSlice.reducer;
