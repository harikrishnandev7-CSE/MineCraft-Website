import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../store/slices/authSlice';
import { authApi } from '../services/authApi';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const handleLogin = async (credentials) => {
    const res = await authApi.login(credentials);
    dispatch(loginSuccess(res));
    return res;
  };

  const handleAdminLogin = async (credentials) => {
    const res = await authApi.adminLogin(credentials);
    dispatch(loginSuccess(res));
    return res;
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    ...auth,
    login: handleLogin,
    adminLogin: handleAdminLogin,
    logout: handleLogout,
  };
}
