export function calculateOrder({
  servicePrice,
  photoCount,
  urgency,
  clientRole,
  hasDiscountCard,
}) {
  let total = servicePrice * photoCount;

  // Срочность = x2
  if (urgency) {
    total *= 2;
  }

  // Скидка профессионалам
  if (clientRole === "Профессионал") {
    total *= 0.9;
  }

  // Дисконтная карта
  if (hasDiscountCard) {
    total *= 0.75;
  }

  // Скидка за большое количество
  if (photoCount >= 100) {
    total *= 0.85;
  }

  return Math.round(total);
}