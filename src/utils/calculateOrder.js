export function calculateOrder({
  servicePrice,
  photoCount,
  urgency,
  clientRole,
  hasDiscountCard,
  personalDiscount = 0,
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

  // Персональная скидка клиента
  if (personalDiscount > 0) {
    total *= (1 - personalDiscount / 100);
  }

  return Math.round(total);
}