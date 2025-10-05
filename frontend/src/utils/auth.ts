export const setToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const setUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
