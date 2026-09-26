import {
  fetchIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@slices/ingredientsSlice';
import { fetchProfileOrders, selectProfileOrders } from '@slices/profileOrdersSlice';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

import styles from '../order-notifications.module.css';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const history = useSelector(selectProfileOrders);
  const ingredientsStatus = useSelector(selectIngredientsStatus);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchProfileOrders());

    const intervalId = window.setInterval(() => {
      void dispatch(fetchProfileOrders());
    }, 10000);

    return (): void => {
      window.clearInterval(intervalId);
    };
  }, [dispatch]);

  const handleRetry = (): void => {
    void dispatch(fetchProfileOrders());

    if (ingredientsStatus === 'failed') {
      void dispatch(fetchIngredients());
    }
  };

  if (ingredientsStatus === 'failed') {
    return (
      <div>
        <p role="alert">{ingredientsError}</p>
        <button type="button" onClick={handleRetry}>
          Повторить загрузку
        </button>
      </div>
    );
  }

  if (!history.isLoaded && history.error) {
    return (
      <div>
        <p role="alert">{history.error}</p>
        <button type="button" onClick={handleRetry}>
          Повторить загрузку
        </button>
      </div>
    );
  }

  if (
    !history.isLoaded ||
    ingredientsStatus === 'idle' ||
    ingredientsStatus === 'loading'
  ) {
    return <Preloader />;
  }

  return (
    <>
      {history.error && <p role="alert">{history.error}</p>}

      <p
        className={`${styles.status} text text_type_main-default`}
        data-visible={history.isLoading}
        role="status"
      >
        Обновляем историю...
      </p>

      {!history.orders.length && <p>Вы ещё не оформили ни одного заказа</p>}

      <ProfileOrdersUI orders={history.orders} />
    </>
  );
};
