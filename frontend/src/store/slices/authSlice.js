import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('mindcraft_token');
const user = localStorage.getItem('mindcraft_user') 
  ? JSON.parse(localStorage.getItem('mindcraft_user')) 
  : null;

const initialState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  role: user?.role || 'participant',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
      localStorage.setItem('mindcraft_token', action.payload.token);
      localStorage.setItem('mindcraft_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = 'participant';
      state.isAuthenticated = false;
      localStorage.removeItem('mindcraft_token');
      localStorage.removeItem('mindcraft_user');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, logout, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;
