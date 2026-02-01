export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isPhone10 = (v: string) => /^\d{10}$/.test(v);

export const isPositiveInt = (v: string | number) => {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isInteger(n) && n > 0;
};

export const isPositiveNumber = (v: string | number) => {
  const n = typeof v === "string" ? Number(v) : v;
  return !isNaN(n) && n > 0;
};
