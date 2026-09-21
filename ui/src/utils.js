/**
 * Utility functions for the SkillBridge platform
 */

/**
 * Formats a number as Indian Rupee currency string
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted string like ₹50,000/mo
 */
export function formatStipend(amount) {
  if (!amount) return 'Unpaid';
  
  // Clean the input (remove non-numeric chars except digits)
  const numeric = typeof amount === 'string' 
    ? amount.replace(/[^0-9]/g, '') 
    : amount;
  
  if (!numeric || isNaN(numeric)) return amount; // Return as is if it's already a string like "Competitive"

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return `${formatter.format(numeric)}/mo`;
}
