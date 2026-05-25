import { buildSchema } from "./buildSchema";
import { generateDart } from "./generators/dart";
import { generateTypeScript } from "./generators/typescript";
import type { JsonModelLanguage } from "./types";

interface GenerateModelOptions {
  input: string;
  className: string;
  language: JsonModelLanguage;
}

export function generateModel({
  input,
  className,
  language,
}: GenerateModelOptions): string {
  const parsed = JSON.parse(input);
  const schema = buildSchema(parsed);
  const safeClassName = className.trim() || "RootModel";

  if (language === "typescript") {
    return generateTypeScript(schema, safeClassName);
  }

  if (language === "dart") {
    return generateDart(schema, safeClassName);
  }

  return "";
}
