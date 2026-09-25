import { logoutUser, selectAuthError, selectAuthLoading } from '@slices/userSlice';
import { ProfileMenuUI } from '@ui';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [logoutAttempted, setLogoutAttempted] = useState(false);

  const handleLogout = (): void => {
    if (isLoading) return;

    setLogoutAttempted(true);
    void dispatch(logoutUser());
  };

  return (
    <>
      <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />

      {logoutAttempted && isLoading && <p role="status">Выходим...</p>}

      {logoutAttempted && error && <p role="alert">{error}</p>}
    </>
  );
};
