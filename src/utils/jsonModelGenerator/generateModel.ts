import { buildSchema } from "./buildSchema";
import { generateDart } from "./generators/dart";
import { generatePython } from "./generators/python";
import { generateTypeScript } from "./generators/typescript";
import type { JsonModelLanguage, SchemaField } from "./types";

interface GenerateModelOptions {
  input: string;
  className: string;
  language: JsonModelLanguage;
}

type GeneratorFunction = (schema: SchemaField, className: string) => string;

const generators: Record<JsonModelLanguage, GeneratorFunction> = {
  typescript: generateTypeScript,
  dart: generateDart,
  python: generatePython,
};

export function generateModel({
  input,
  className,
  language,
}: GenerateModelOptions): string {
  const parsed = JSON.parse(input);

  const schema = buildSchema(parsed);

  function toPascalCase(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
      .replace(/^[a-z]/, (char) => char.toUpperCase());
  }

  const safeClassName = toPascalCase(className.trim() || "RootModel");

  const generator = generators[language];

  return generator(schema, safeClassName);
}
