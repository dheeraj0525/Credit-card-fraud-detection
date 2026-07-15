export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "$0.00";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  } catch (e) {
    return `$${Number(amount).toFixed(2)}`;
  }
}
