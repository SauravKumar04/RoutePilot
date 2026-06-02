/**
 * Formats a numeric price into a localized financial currency structure.
 * @param {number} value - The financial amount.
 * @param {string} currencyCode - Target ISO currency descriptor (defaults to USD).
 * @returns {string} Formatted localized currency string.
 */
export const formatCurrency = (value, currencyCode = 'USD') => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};