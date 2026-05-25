import type { SchemaField } from "../types";

function toPascalCase(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

function getTypeScriptType(field: SchemaField, parentName: string): string {
  if (field.type === "string") {
    return "string";
  }

  if (field.type === "number") {
    return "number";
  }

  if (field.type === "boolean") {
    return "boolean";
  }

  if (field.type === "null") {
    return "null";
  }

  if (field.type === "array") {
    if (!field.arrayItem) {
      return "unknown[]";
    }

    return `${getTypeScriptType(field.arrayItem, parentName)}[]`;
  }

  if (field.type === "object") {
    return toPascalCase(`${parentName} ${field.name}`);
  }

  return "unknown";
}

function collectInterfaces(
  field: SchemaField,
  interfaceName: string,
  interfaces: string[],
): void {
  if (field.type !== "object") {
    return;
  }

  const lines = field.children.map((child) => {
    const childType = getTypeScriptType(child, interfaceName);

    return `  ${child.name}: ${childType};`;
  });

  interfaces.push(
    `export interface ${interfaceName} {\n${lines.join("\n")}\n}`,
  );

  field.children.forEach((child) => {
    if (child.type === "object") {
      collectInterfaces(
        child,
        getTypeScriptType(child, interfaceName),
        interfaces,
      );
    }

    if (child.type === "array" && child.arrayItem?.type === "object") {
      collectInterfaces(
        child.arrayItem,
        toPascalCase(`${interfaceName} ${child.name}`),
        interfaces,
      );
    }
  });
}

export function generateTypeScript(
  schema: SchemaField,
  className: string,
): string {
  const interfaces: string[] = [];

  if (schema.type === "array" && schema.arrayItem?.type === "object") {
    collectInterfaces(schema.arrayItem, className, interfaces);

    return interfaces.join("\n\n");
  }

  if (schema.type === "object") {
    collectInterfaces(schema, className, interfaces);

    return interfaces.join("\n\n");
  }

  return `export type ${className} = ${getTypeScriptType(schema, className)};`;
}
