/**
 * Utility to clean city names by removing any raw "_aliases: ..." text.
 * Safe for both client and server components (no node-only dependencies).
 */
export function cleanCityName(cityStr: string): string {
  if (!cityStr) return '';
  
  let clean = cityStr;
  
  // Strip out _aliases: ...
  const aliasIdx = clean.indexOf('_aliases:');
  if (aliasIdx !== -1) {
    clean = clean.substring(0, aliasIdx);
  }
  
  // Strip out markdown bold formatting asterisks
  clean = clean.replace(/\*\*/g, '');
  
  return clean.trim();
}
