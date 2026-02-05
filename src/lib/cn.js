/**
 * cn - Class name utility
 * Merges class names safely, handling arrays and falsy values
 */
export function cn(...parts) {
  return parts
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim() || '';
}
