import type { SchemaField } from "../types";

function toPascalCase(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

function getPythonType(field: SchemaField, parentName: string): string {
  if (field.type === "string") {
    return "str";
  }

  if (field.type === "number") {
    return field.isInteger ? "int" : "float";
  }

  if (field.type === "boolean") {
    return "bool";
  }

  if (field.type === "null") {
    return "Any";
  }

  if (field.type === "array") {
    if (!field.arrayItem) {
      return "list[Any]";
    }

    if (field.arrayItem.type === "object") {
      return `list[${toPascalCase(`${parentName} ${field.name}`)}]`;
    }

    return `list[${getPythonType(field.arrayItem, parentName)}]`;
  }

  if (field.type === "object") {
    return toPascalCase(`${parentName} ${field.name}`);
  }

  return "Any";
}

function collectClasses(
  field: SchemaField,
  className: string,
  classes: string[],
): void {
  if (field.type !== "object") {
    return;
  }

  const fields = field.children
    .map((child) => {
      return `    ${child.name}: ${getPythonType(child, className)}`;
    })
    .join("\n");

  classes.push(`@dataclass\nclass ${className}:\n${fields || "    pass"}`);

  field.children.forEach((child) => {
    if (child.type === "object") {
      collectClasses(child, getPythonType(child, className), classes);
    }

    if (child.type === "array" && child.arrayItem?.type === "object") {
      collectClasses(
        child.arrayItem,
        toPascalCase(`${className} ${child.name}`),
        classes,
      );
    }
  });
}

export function generatePython(schema: SchemaField, className: string): string {
  const classes: string[] = [];

  if (schema.type === "array" && schema.arrayItem?.type === "object") {
    collectClasses(schema.arrayItem, className, classes);
  } else if (schema.type === "object") {
    collectClasses(schema, className, classes);
  }

  return [
    "from dataclasses import dataclass",
    "from typing import Any",
    "",
    ...classes,
  ].join("\n\n");
}
