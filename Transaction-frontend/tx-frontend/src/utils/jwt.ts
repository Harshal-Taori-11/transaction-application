export const decodeJwt = (token?: string) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = atob(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
};
