export type JsonModelLanguage = "typescript" | "dart";

export type SchemaType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "array"
  | "object"
  | "unknown";

export interface SchemaField {
  name: string;
  type: SchemaType;
  children: SchemaField[];
  arrayItem?: SchemaField;
  isInteger: boolean;
}
