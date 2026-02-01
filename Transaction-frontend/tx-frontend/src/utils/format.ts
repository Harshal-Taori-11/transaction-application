export const formatAmount = (n: number) => n.toFixed(2);
export const mapStatus = (s: "PENDING" | "COMPLETED" | "REJECTED") =>
  s === "COMPLETED" ? "Successful" : s === "PENDING" ? "Pending" : "Failed";
