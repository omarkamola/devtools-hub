/**
 * Splits a string into individual words, handling:
 * - spaces, hyphens, underscores as delimiters
 * - camelCase / PascalCase boundaries (e.g. "camelCase" → ["camel", "Case"])
 */
function splitIntoWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // ABCDef → ABC Def
    .split(/[\s\-_]+/)
    .filter(Boolean);
}

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(
    /\b\w/g,
    (char) => char.toUpperCase()
  );
}

export function toCamelCase(text: string): string {
  const words = splitIntoWords(text);
  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
}

export function toPascalCase(text: string): string {
  const words = splitIntoWords(text);
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function toSnakeCase(text: string): string {
  const words = splitIntoWords(text);
  return words.map((word) => word.toLowerCase()).join("_");
}

export function toKebabCase(text: string): string {
  const words = splitIntoWords(text);
  return words.map((word) => word.toLowerCase()).join("-");
}
