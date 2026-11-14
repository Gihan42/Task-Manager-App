export interface AuthResponseData {
  token?: string;
  refreshToken?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Saves auth tokens and user details into browser localStorage.
 */
export const saveAuthData = (data: AuthResponseData) => {
  if (!data) return;

  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  if (data.email) {
    localStorage.setItem('email', data.email);
  }
  if (data.role) {
    localStorage.setItem('role', data.role);
  }
  // Store the full user data object as JSON as well
  localStorage.setItem('user', JSON.stringify(data));
};

/**
 * Retrieves stored auth data from localStorage.
 */
export const getAuthData = (): AuthResponseData | null => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      // ignore JSON parse error
    }
  }

  const token = localStorage.getItem('token') || undefined;
  const refreshToken = localStorage.getItem('refreshToken') || undefined;
  const email = localStorage.getItem('email') || undefined;
  const role = localStorage.getItem('role') || undefined;

  if (!token && !email) {
    return null;
  }

  return { token, refreshToken, email, role };
};

/**
 * Clears all auth data from localStorage (on logout).
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};
