const development = true;
export const config = {
  apiUrl: development ? "http://localhost:4000" : window.location.origin
};