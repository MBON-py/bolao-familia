const BRT = 'America/Sao_Paulo';

function toDate(dateStr) {
  // Treat stored datetime strings as UTC
  return new Date(dateStr.replace(' ', 'T') + 'Z');
}

// Returns "YYYY-MM-DD" in Brazil timezone — use for grouping matches by local date
export function getLocalDateBR(dateStr) {
  return toDate(dateStr).toLocaleDateString('en-CA', { timeZone: BRT });
}

// Formats a Brazil-local "YYYY-MM-DD" date for display with weekday
export function formatDate(localDateStr) {
  // T12:00:00Z ensures conversion to BRT (UTC-3) never crosses the day boundary
  const d = new Date(localDateStr + 'T12:00:00Z');
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long',
    timeZone: BRT,
  });
}

// Formats HH:MM from a UTC datetime string converted to Brazil timezone
export function formatTime(dateStr) {
  return toDate(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
    timeZone: BRT,
  });
}
