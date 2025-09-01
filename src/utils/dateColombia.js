// Utilidad para ajustar fechas a la hora de Colombia (UTC-5)
export function toColombiaDate(dateInput) {
  const date = new Date(dateInput);
  // Ajustar a UTC-5 (Colombia)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  // Colombia está en UTC-5 todo el año
  const colombiaOffset = -5;
  const colombiaTime = new Date(utc + 3600000 * colombiaOffset);
  return colombiaTime;
}

export function formatColombiaDate(dateInput, options = {}) {
  const date = toColombiaDate(dateInput);
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  });
}

export function formatColombiaShortDate(dateInput, options = {}) {
  const date = toColombiaDate(dateInput);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
}
