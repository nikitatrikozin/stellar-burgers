import { createSlice, nanoid } from '@reduxjs/toolkit';

import { createOrder } from './orderSlice';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      prepare: (ingredient: TIngredient) => ({
        payload: {
          ...ingredient,
          id: nanoid(),
        },
      }),
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
    },

    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== action.payload
      );
    },

    moveIngredient: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;

      if (
        from < 0 ||
        from >= state.ingredients.length ||
        to < 0 ||
        to >= state.ingredients.length ||
        from === to
      ) {
        return;
      }

      const [ingredient] = state.ingredients.splice(from, 1);
      state.ingredients.splice(to, 0, ingredient);
    },

    clearConstructor: () => ({
      bun: null,
      ingredients: [],
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, (state) => {
      state.bun = null;
      state.ingredients = [];
    });
  },
  selectors: {
    selectConstructorItems: (state) => state,
  },
});

export const { addIngredient, removeIngredient, moveIngredient, clearConstructor } =
  constructorSlice.actions;

export const { selectConstructorItems } = constructorSlice.selectors;

export default constructorSlice.reducer;
