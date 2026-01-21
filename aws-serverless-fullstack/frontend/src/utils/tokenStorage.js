export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  getIdToken() {
    return localStorage.getItem('idToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  setTokens(accessToken, idToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
  }
};
