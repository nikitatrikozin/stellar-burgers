import {
  clearAuthError,
  loginUser,
  selectAuthError,
  selectAuthLoading,
} from '@slices/userSlice';
import { Preloader } from '@ui';
import { LoginUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;

    void dispatch(loginUser({ email, password }));
  };

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <LoginUI
      errorText={error ?? ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
