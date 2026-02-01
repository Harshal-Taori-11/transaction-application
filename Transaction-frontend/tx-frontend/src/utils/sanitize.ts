export const basicSanitize = (s: string) => {
  if (!s) return s;
  const bad = /(;|--|\/\*|\*\/|drop|insert|update|delete)/i;
  return bad.test(s) ? "" : s.trim();
};
