import type { SchemaField } from "../types";

function toPascalCase(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

function toCamelCase(value: string): string {
  const pascalCase = toPascalCase(value);

  return pascalCase.replace(/^[A-Z]/, (char) => char.toLowerCase());
}

function getDartType(field: SchemaField, parentName: string): string {
  if (field.type === "string") {
    return "String";
  }

  if (field.type === "number") {
    return field.isInteger ? "int" : "double";
  }

  if (field.type === "boolean") {
    return "bool";
  }

  if (field.type === "null") {
    return "dynamic";
  }

  if (field.type === "array") {
    if (!field.arrayItem) {
      return "List<dynamic>";
    }

    return `List<${getDartType(field.arrayItem, parentName)}>`;
  }

  if (field.type === "object") {
    return toPascalCase(`${parentName} ${field.name}`);
  }

  return "dynamic";
}

function collectClasses(
  field: SchemaField,
  className: string,
  classes: string[],
): void {
  if (field.type !== "object") {
    return;
  }

  const safeClassName = toPascalCase(className);

  const fields = field.children
    .map((child) => {
      const dartType = getDartType(child, safeClassName);
      const fieldName = toCamelCase(child.name);

      return `  final ${dartType} ${fieldName};`;
    })
    .join("\n");

  const constructorFields = field.children
    .map((child) => {
      const fieldName = toCamelCase(child.name);

      return `    required this.${fieldName},`;
    })
    .join("\n");

  classes.push(
    `class ${safeClassName} {\n${fields}\n\n  const ${safeClassName}({\n${constructorFields}\n  });\n}`,
  );

  field.children.forEach((child) => {
    if (child.type === "object") {
      collectClasses(child, getDartType(child, safeClassName), classes);
    }

    if (child.type === "array" && child.arrayItem?.type === "object") {
      collectClasses(
        child.arrayItem,
        toPascalCase(`${safeClassName} ${child.name}`),
        classes,
      );
    }
  });
}

export function generateDart(schema: SchemaField, className: string): string {
  const classes: string[] = [];
  const safeClassName = toPascalCase(className);

  if (schema.type === "array" && schema.arrayItem?.type === "object") {
    collectClasses(schema.arrayItem, safeClassName, classes);

    return classes.join("\n\n");
  }

  if (schema.type === "object") {
    collectClasses(schema, safeClassName, classes);

    return classes.join("\n\n");
  }

  return `typedef ${safeClassName} = ${getDartType(schema, safeClassName)};`;
}
