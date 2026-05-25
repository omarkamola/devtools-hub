type SchemaType = "string" | "number" | "boolean" | "object" | "array" | "null" | "unknown";

interface SchemaField {
  name: string;
  type: SchemaType;
  children: SchemaField[];
  arrayItem?: SchemaField;
  isInteger: boolean;
}

function getSchemaType(value: unknown): SchemaType {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  const valueType = typeof value;

  if (valueType === "string") {
    return "string";
  }

  if (valueType === "number") {
    return "number";
  }

  if (valueType === "boolean") {
    return "boolean";
  }

  if (valueType === "object") {
    return "object";
  }

  return "unknown";
}

function buildField(name: string, value: unknown): SchemaField {
  const type = getSchemaType(value);

  if (type === "object" && value && !Array.isArray(value)) {
    return {
      name,
      type,
      children: Object.entries(value).map(([key, childValue]) =>
        buildField(key, childValue)
      ),
      isInteger: false,
    };
  }

  if (type === "array") {
    const items = value as unknown[];
    const firstItem = items[0];

    return {
      name,
      type,
      children: [],
      arrayItem:
        firstItem === undefined
          ? {
              name: "item",
              type: "unknown",
              children: [],
              isInteger: false,
            }
          : buildField("item", firstItem),
      isInteger: false,
    };
  }

  return {
    name,
    type,
    children: [],
    isInteger: typeof value === "number" && Number.isInteger(value),
  };
}

export function buildSchema(value: unknown): SchemaField {
  return buildField("root", value);
}