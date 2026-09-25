import {
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type UserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isAuthChecking: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  isAuthChecking: false,
  isLoading: false,
  error: null,
};

export const checkUserAuth = createAsyncThunk<
  TUser | null,
  void,
  { state: { user: UserState } }
>(
  'user/checkUserAuth',
  async (): Promise<TUser | null> => {
    const accessToken = getCookie('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');

    if (!accessToken && !savedRefreshToken) {
      return null;
    }

    if (!accessToken && savedRefreshToken) {
      await refreshToken();
    }

    const response = await getUserApi();

    if (!response.success) {
      throw new Error('Не удалось проверить пользователя');
    }

    return response.user;
  },
  {
    condition: (_, { getState }) => {
      const { isAuthChecking, isAuthChecked } = getState().user;

      return !isAuthChecking && !isAuthChecked;
    },
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (data: TLoginData): Promise<TUser> => {
    const response = await loginUserApi(data);

    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    return response.user;
  }
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: TRegisterData): Promise<TUser> => {
    const response = await registerUserApi(data);

    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    return response.user;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>): Promise<TUser> => {
    const response = await updateUserApi(data);

    if (!response.success) {
      throw new Error('Не удалось обновить профиль');
    }

    return response.user;
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (): Promise<void> => {
    const response = await logoutApi();

    if (!response.success) {
      throw new Error('Не удалось выйти');
    }

    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthChecking = true;
        state.isAuthChecked = false;
        state.error = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecking = false;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.user = null;
        state.isAuthChecking = false;
        state.isAuthChecked = true;
        state.error = action.error.message ?? 'Не удалось проверить сессию';
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось войти';
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось зарегистрироваться';
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось обновить профиль';
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось выйти';
      });
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectAuthLoading: (state) => state.isLoading,
    selectAuthError: (state) => state.error,
  },
});

export const { clearAuthError } = userSlice.actions;

export const { selectUser, selectIsAuthChecked, selectAuthLoading, selectAuthError } =
  userSlice.selectors;

export default userSlice.reducer;
