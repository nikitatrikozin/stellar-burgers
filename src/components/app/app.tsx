import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { checkUserAuth } from '@slices/userSlice';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useDispatch } from '@services/store';

import { ProtectedRoute } from '../protected-route/protected-route';

import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

type ModalLocationState = {
  background?: Location;
};

const OrderDetails = ({
  isModal = false,
  onClose,
}: {
  isModal?: boolean;
  onClose?: () => void;
}): React.JSX.Element => {
  const { number } = useParams();
  const title = `#${(number ?? '').padStart(6, '0')}`;

  if (isModal && onClose) {
    return (
      <Modal title={title} onClose={onClose}>
        <OrderInfo />
      </Modal>
    );
  }

  return (
    <main className={styles.detailPageWrap}>
      <h1 className={`${styles.detailHeader} text text_type_digits-default`}>{title}</h1>
      <OrderInfo />
    </main>
  );
};

const App = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as ModalLocationState | null;
  const background = state?.background;

  const handleCloseModal = (): void => {
    void navigate(-1);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />

      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />

        <Route
          path="/ingredients/:id"
          element={
            <main className={styles.detailPageWrap}>
              <h1 className={`${styles.detailHeader} text text_type_main-large`}>
                Детали ингредиента
              </h1>
              <IngredientDetails />
            </main>
          }
        />

        <Route path="/feed/:number" element={<OrderDetails />} />

        <Route element={<ProtectedRoute onlyUnAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<ProfileOrders />} />
          <Route path="/profile/orders/:number" element={<OrderDetails />} />
        </Route>

        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={handleCloseModal}>
                <IngredientDetails />
              </Modal>
            }
          />

          <Route
            path="/feed/:number"
            element={<OrderDetails isModal onClose={handleCloseModal} />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/profile/orders/:number"
              element={<OrderDetails isModal onClose={handleCloseModal} />}
            />
          </Route>
        </Routes>
      )}
    </div>
  );
};

export default App;
