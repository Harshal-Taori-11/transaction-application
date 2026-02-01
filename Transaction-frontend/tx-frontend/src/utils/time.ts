import { format } from "date-fns";
export const formatIST = (iso: string) => {
  try {
    return format(new Date(iso), "dd MMM yyyy, HH:mm");
  } catch {
    return iso;
  }
};
