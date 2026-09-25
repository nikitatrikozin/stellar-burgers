import {
  fetchIngredients,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@slices/ingredientsSlice';
import { fetchOrderDetails, selectOrderDetails } from '@slices/orderDetailsSlice';
import { OrderInfoUI, Preloader } from '@ui';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

type IngredientsWithCount = Record<string, TIngredient & { count: number }>;

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams();
  const dispatch = useDispatch();

  const details = useSelector(selectOrderDetails);
  const ingredients = useSelector(selectIngredients);
  const ingredientsStatus = useSelector(selectIngredientsStatus);
  const ingredientsError = useSelector(selectIngredientsError);

  const orderNumber = Number(number);

  const isValidNumber =
    /^\d+$/.test(number ?? '') && Number.isSafeInteger(orderNumber) && orderNumber > 0;

  useEffect(() => {
    if (isValidNumber) {
      void dispatch(fetchOrderDetails(orderNumber));
    }
  }, [dispatch, isValidNumber, orderNumber]);

  const handleRetry = (): void => {
    if (!isValidNumber) return;

    void dispatch(fetchOrderDetails(orderNumber));

    if (ingredientsStatus === 'failed') {
      void dispatch(fetchIngredients());
    }
  };

  if (!isValidNumber) {
    return <p className="text text_type_main-default">Некорректный номер заказа</p>;
  }

  const isCurrentOrder = details.requestedNumber === orderNumber;

  const error =
    ingredientsStatus === 'failed'
      ? ingredientsError
      : isCurrentOrder
        ? details.error
        : null;

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button type="button" onClick={handleRetry}>
          Повторить загрузку
        </button>
      </div>
    );
  }

  if (
    !isCurrentOrder ||
    details.isLoading ||
    ingredientsStatus === 'idle' ||
    ingredientsStatus === 'loading'
  ) {
    return <Preloader />;
  }

  const orderData = details.order;

  if (!orderData) {
    return <p className="text text_type_main-default">Заказ не найден</p>;
  }

  const ingredientsInfo: IngredientsWithCount = {};

  for (const ingredientId of orderData.ingredients) {
    const existingIngredient = ingredientsInfo[ingredientId];

    if (existingIngredient) {
      existingIngredient.count += 1;
      continue;
    }

    const ingredient = ingredients.find((item) => item._id === ingredientId);

    if (!ingredient) {
      return (
        <p role="alert" className="text text_type_main-default">
          Не удалось найти часть ингредиентов заказа. Полная стоимость недоступна.
        </p>
      );
    }

    ingredientsInfo[ingredientId] = {
      ...ingredient,
      count: 1,
    };
  }

  const total = Object.values(ingredientsInfo).reduce(
    (sum, ingredient) => sum + ingredient.price * ingredient.count,
    0
  );

  const orderInfo = {
    ...orderData,
    ingredientsInfo,
    date: new Date(orderData.createdAt),
    total,
  };

  return <OrderInfoUI orderInfo={orderInfo} />;
};
