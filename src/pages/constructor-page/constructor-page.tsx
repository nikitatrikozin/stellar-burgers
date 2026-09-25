import { BurgerIngredients, BurgerConstructor } from '@components';
import {
  fetchIngredients,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@slices/ingredientsSlice';
import { selectOrderRequest } from '@slices/orderSlice';
import { Preloader } from '@ui';

import { useDispatch, useSelector } from '@services/store';

import styles from './constructor-page.module.css';

export const ConstructorPage = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const status = useSelector(selectIngredientsStatus);
  const error = useSelector(selectIngredientsError);
  const orderRequest = useSelector(selectOrderRequest);

  if (status === 'idle' || status === 'loading') {
    return <Preloader />;
  }

  if (status === 'failed') {
    return (
      <main className={styles.containerMain}>
        <p role="alert">{error}</p>
        <button
          type="button"
          onClick={() => {
            void dispatch(fetchIngredients());
          }}
        >
          Повторить загрузку
        </button>
      </main>
    );
  }

  if (!ingredients.length) {
    return (
      <main className={styles.containerMain}>
        <p>Нет доступных ингредиентов</p>
      </main>
    );
  }

  return (
    <main className={styles.containerMain} inert={orderRequest}>
      <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
        Соберите бургер
      </h1>
      <div className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients />
        <BurgerConstructor />
      </div>
    </main>
  );
};
