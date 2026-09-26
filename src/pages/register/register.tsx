import {
  clearAuthError,
  registerUser,
  selectAuthError,
  selectAuthLoading,
} from '@slices/userSlice';
import { Preloader } from '@ui';
import { RegisterUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;

    void dispatch(
      registerUser({
        name: userName,
        email,
        password,
      })
    );
  };

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <RegisterUI
      errorText={error ?? ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
