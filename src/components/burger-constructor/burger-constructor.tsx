import { selectConstructorItems } from '@slices/constructorSlice';
import {
  clearOrder,
  createOrder,
  selectCreatedOrder,
  selectOrderError,
  selectOrderRequest,
} from '@slices/orderSlice';
import { selectIsAuthChecked, selectUser } from '@slices/userSlice';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectCreatedOrder);
  const error = useSelector(selectOrderError);
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  const onOrderClick = (): void => {
    if (!isAuthChecked || orderRequest) return;

    if (!user) {
      void navigate('/login', {
        state: { from: location },
      });
      return;
    }

    if (!constructorItems.bun) return;

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      constructorItems.bun._id,
    ];

    void dispatch(createOrder(ingredientIds));
  };

  const closeOrderModal = (): void => {
    if (orderRequest) return;

    dispatch(clearOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (total, ingredient) => total + ingredient.price,
        0
      ),
    [constructorItems]
  );

  return (
    <>
      <BurgerConstructorUI
        price={price}
        orderRequest={orderRequest}
        constructorItems={constructorItems}
        orderModalData={orderModalData}
        onOrderClick={onOrderClick}
        closeOrderModal={closeOrderModal}
      />

      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
    </>
  );
};
