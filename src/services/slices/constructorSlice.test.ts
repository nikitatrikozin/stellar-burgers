import constructorReducer, {
  addIngredient,
  clearConstructor,
  moveIngredient,
  removeIngredient,
} from './constructorSlice';
import { createOrder } from './orderSlice';

import type { TIngredient, TOrder } from '@utils-types';

const bun: TIngredient = {
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

const filling: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
};

type ConstructorState = ReturnType<typeof constructorReducer>;

describe('Редьюсер burgerConstructor', () => {
  test('Возвращает начальное состояние при undefined и неизвестном экшене', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  test('Добавляет булку в поле bun, сохраняя список начинок', () => {
    const previousState: ConstructorState = {
      bun: null,
      ingredients: [{ ...filling, id: 'filling-1' }],
    };

    const action = addIngredient(bun);
    const state = constructorReducer(previousState, action);

    expect(state).toEqual({
      bun: { ...bun, id: action.payload.id },
      ingredients: previousState.ingredients,
    });

    expect(previousState.bun).toBeNull();
  });

  test('Заменяет ранее выбранную булку новой', () => {
    const previousState: ConstructorState = {
      bun: { ...bun, id: 'old-bun' },
      ingredients: [{ ...filling, id: 'filling-1' }],
    };

    const anotherBun: TIngredient = {
      ...bun,
      _id: 'another-bun',
      name: 'Другая тестовая булка',
      price: 500,
    };

    const action = addIngredient(anotherBun);
    const state = constructorReducer(previousState, action);

    expect(state).toEqual({
      bun: { ...anotherBun, id: action.payload.id },
      ingredients: previousState.ingredients,
    });
  });

  test('Добавляет начинку в конец списка, сохраняя булку и предыдущие начинки', () => {
    const previousState: ConstructorState = {
      bun: { ...bun, id: 'bun-1' },
      ingredients: [{ ...filling, id: 'filling-1' }],
    };

    const action = addIngredient(filling);
    const state = constructorReducer(previousState, action);

    expect(state).toEqual({
      bun: previousState.bun,
      ingredients: [previousState.ingredients[0], { ...filling, id: action.payload.id }],
    });

    expect(previousState.ingredients).toHaveLength(1);
  });

  test('Назначает разные id двум экземплярам одинаковой начинки', () => {
    const firstAction = addIngredient(filling);
    const secondAction = addIngredient(filling);

    const stateAfterFirst = constructorReducer(undefined, firstAction);
    const stateAfterSecond = constructorReducer(stateAfterFirst, secondAction);

    expect(stateAfterSecond.ingredients).toEqual([
      { ...filling, id: firstAction.payload.id },
      { ...filling, id: secondAction.payload.id },
    ]);

    expect(typeof firstAction.payload.id).toBe('string');
    expect(typeof secondAction.payload.id).toBe('string');

    expect(firstAction.payload.id.length).toBeGreaterThan(0);
    expect(secondAction.payload.id.length).toBeGreaterThan(0);

    expect(stateAfterSecond.ingredients[0].id).not.toBe(
      stateAfterSecond.ingredients[1].id
    );
  });

  test('Удаляет по id только выбранный экземпляр начинки, сохраняя булку', () => {
    const firstFilling = { ...filling, id: 'filling-1' };
    const secondFilling = { ...filling, id: 'filling-2' };

    const previousState: ConstructorState = {
      bun: { ...bun, id: 'bun-1' },
      ingredients: [firstFilling, secondFilling],
    };

    const state = constructorReducer(previousState, removeIngredient('filling-1'));

    expect(state).toEqual({
      bun: previousState.bun,
      ingredients: [secondFilling],
    });

    expect(previousState.ingredients).toEqual([firstFilling, secondFilling]);
  });

  test.each([
    {
      from: 0,
      to: 2,
      expectedIds: ['filling-2', 'filling-3', 'filling-1'],
    },
    {
      from: 2,
      to: 0,
      expectedIds: ['filling-3', 'filling-1', 'filling-2'],
    },
  ])(
    'Перемещает начинку с позиции $from на позицию $to',
    ({ from, to, expectedIds }) => {
      const first = { ...filling, id: 'filling-1' };
      const second = { ...filling, id: 'filling-2' };
      const third = { ...filling, id: 'filling-3' };

      const previousState: ConstructorState = {
        bun: { ...bun, id: 'bun-1' },
        ingredients: [first, second, third],
      };

      const state = constructorReducer(previousState, moveIngredient({ from, to }));

      expect(state.ingredients.map((item) => item.id)).toEqual(expectedIds);
      expect(state.ingredients).toHaveLength(3);
      expect(state.ingredients).toEqual(expect.arrayContaining([first, second, third]));
      expect(state.bun).toEqual(previousState.bun);

      expect(previousState.ingredients).toEqual([first, second, third]);
    }
  );

  test.each([
    { from: -1, to: 0 },
    { from: 2, to: 0 },
    { from: 0, to: -1 },
    { from: 0, to: 2 },
    { from: 0, to: 0 },
  ])(
    'Не меняет конструктор при перемещении с $from на $to без допустимой смены позиции',
    ({ from, to }) => {
      const previousState: ConstructorState = {
        bun: { ...bun, id: 'bun-1' },
        ingredients: [
          { ...filling, id: 'filling-1' },
          { ...filling, id: 'filling-2' },
        ],
      };

      const state = constructorReducer(previousState, moveIngredient({ from, to }));

      expect(state).toEqual(previousState);
    }
  );

  test('Сохраняет состояние при удалении начинки с неизвестным id', () => {
    const previousState: ConstructorState = {
      bun: { ...bun, id: 'bun-1' },
      ingredients: [{ ...filling, id: 'filling-1' }],
    };

    const state = constructorReducer(previousState, removeIngredient('unknown-id'));

    expect(state).toEqual(previousState);
  });

  test('Очищает булку и начинки по clearConstructor', () => {
    const previousState: ConstructorState = {
      bun: { ...bun, id: 'bun-1' },
      ingredients: [{ ...filling, id: 'filling-1' }],
    };

    const state = constructorReducer(previousState, clearConstructor());

    expect(state).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  test('Очищает булку и начинки после успешного создания заказа', () => {
    const previousState: ConstructorState = {
      bun: { ...bun, id: 'bun-1' },
      ingredients: [{ ...filling, id: 'filling-1' }],
    };

    const ingredientIds = [bun._id, filling._id, bun._id];

    const order: TOrder = {
      _id: 'test-order-12345',
      number: 12345,
      status: 'done',
      name: 'Тестовый бургер',
      ingredients: ingredientIds,
      createdAt: '2026-09-26T12:00:00.000Z',
      updatedAt: '2026-09-26T12:00:00.000Z',
    };

    const action = createOrder.fulfilled(order, 'request-id', ingredientIds);
    const state = constructorReducer(previousState, action);

    expect(state).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});
