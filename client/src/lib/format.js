export const rands = (value = 0) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

export const starString = (rating = 0) => {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
};

export const titleCase = (value = '') =>
  value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
