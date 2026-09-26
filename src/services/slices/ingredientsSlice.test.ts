import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';

import type { TIngredient } from '@utils-types';

const ingredient: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
};

type IngredientsState = ReturnType<typeof ingredientsReducer>;

describe('Редьюсер ingredients', () => {
  test('Возвращает начальное состояние при undefined и неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({
      items: [],
      status: 'idle',
      error: null,
    });
  });

  test('При pending включает загрузку, сбрасывает ошибку и сохраняет ингредиенты', () => {
    const previousState: IngredientsState = {
      items: [ingredient],
      status: 'failed',
      error: 'Предыдущая ошибка',
    };

    const action = fetchIngredients.pending('request-id', undefined);
    const state = ingredientsReducer(previousState, action);

    expect(state).toEqual({
      items: [ingredient],
      status: 'loading',
      error: null,
    });
  });

  test('При fulfilled сохраняет полученные ингредиенты и успешный статус', () => {
    const previousState: IngredientsState = {
      items: [],
      status: 'loading',
      error: null,
    };

    const action = fetchIngredients.fulfilled([ingredient], 'request-id', undefined);
    const state = ingredientsReducer(previousState, action);

    expect(state).toEqual({
      items: [ingredient],
      status: 'succeeded',
      error: null,
    });
  });

  test('При rejected сохраняет сообщение ошибки и ранее загруженные ингредиенты', () => {
    const previousState: IngredientsState = {
      items: [ingredient],
      status: 'loading',
      error: null,
    };

    const action = fetchIngredients.rejected(
      new Error('Сервер недоступен'),
      'request-id',
      undefined
    );
    const state = ingredientsReducer(previousState, action);

    expect(state).toEqual({
      items: [ingredient],
      status: 'failed',
      error: 'Сервер недоступен',
    });
  });

  test('При rejected без сообщения использует стандартный текст ошибки', () => {
    const previousState: IngredientsState = {
      items: [],
      status: 'loading',
      error: null,
    };

    const state = ingredientsReducer(previousState, {
      type: fetchIngredients.rejected.type,
      error: {},
    });

    expect(state).toEqual({
      items: [],
      status: 'failed',
      error: 'Не удалось загрузить ингредиенты',
    });
  });
});
