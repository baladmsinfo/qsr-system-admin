export default defineNuxtPlugin(() => {
  const currency = useCookie("code"); // "INR", "USD", etc.

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.value || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return {
    provide: {
      formatPrice
    }
  };
});
