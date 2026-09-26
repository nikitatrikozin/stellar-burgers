import { resetPasswordApi } from '@api';
import { Preloader } from '@ui';
import { ResetPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ResetPassword = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    void resetPasswordApi({ password, token })
      .then(() => {
        localStorage.removeItem('resetPassword');
        void navigate('/login', { replace: true });
      })
      .catch((err: Error) => setError(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!localStorage.getItem('resetPassword')) {
      void navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);
  if (isLoading) {
    return <Preloader />;
  }
  return (
    <ResetPasswordUI
      errorText={error?.message}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
