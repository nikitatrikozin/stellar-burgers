import {
  clearAuthError,
  selectAuthError,
  selectAuthLoading,
  selectUser,
  updateUser,
} from '@slices/userSlice';
import { ProfileUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { TRegisterData } from '@api';
import type { ChangeEvent, SyntheticEvent } from 'react';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  }, [user]);

  const isFormChanged =
    formValue.name !== (user?.name ?? '') ||
    formValue.email !== (user?.email ?? '') ||
    formValue.password !== '';

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (!user || !isFormChanged || isLoading) return;

    const changes: Partial<TRegisterData> = {};

    if (formValue.name !== user.name) {
      changes.name = formValue.name;
    }

    if (formValue.email !== user.email) {
      changes.email = formValue.email;
    }

    if (formValue.password !== '') {
      changes.password = formValue.password;
    }

    void dispatch(updateUser(changes));
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;

    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });

    dispatch(clearAuthError());
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValue((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <>
      {isLoading && (
        <p role="status" className="text text_type_main-default">
          Выполняем запрос...
        </p>
      )}

      <fieldset
        disabled={isLoading}
        style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
      >
        <ProfileUI
          formValue={formValue}
          isFormChanged={isFormChanged}
          updateUserError={error ?? ''}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          handleInputChange={handleInputChange}
        />
      </fieldset>
    </>
  );
};
