export type CronValidationResult = {
  isValid: boolean;
  message: string;
};

export type CronExample = {
  label: string;
  expression: string;
  description: string;
};

export type CronFieldValues = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

export const CRON_EXAMPLES: CronExample[] = [
  {
    label: "Every minute",
    expression: "* * * * *",
    description: "Runs every minute.",
  },
  {
    label: "Every 15 minutes",
    expression: "*/15 * * * *",
    description: "Runs every 15 minutes.",
  },
  {
    label: "Every hour",
    expression: "0 * * * *",
    description: "Runs at minute 0 of every hour.",
  },
  {
    label: "Every day at 9 AM",
    expression: "0 9 * * *",
    description: "Runs every day at 9:00 AM.",
  },
  {
    label: "Every Monday at 9 AM",
    expression: "0 9 * * 1",
    description: "Runs every Monday at 9:00 AM.",
  },
  {
    label: "Every month on day 1",
    expression: "0 0 1 * *",
    description: "Runs at midnight on the first day of every month.",
  },
];

const FIELD_RULES = [
  {
    name: "minute",
    min: 0,
    max: 59,
  },
  {
    name: "hour",
    min: 0,
    max: 23,
  },
  {
    name: "day of month",
    min: 1,
    max: 31,
  },
  {
    name: "month",
    min: 1,
    max: 12,
  },
  {
    name: "day of week",
    min: 0,
    max: 7,
  },
];

export function buildCronExpression(values: CronFieldValues): string {
  return [
    values.minute.trim() || "*",
    values.hour.trim() || "*",
    values.dayOfMonth.trim() || "*",
    values.month.trim() || "*",
    values.dayOfWeek.trim() || "*",
  ].join(" ");
}

export function validateCronExpression(
  expression: string,
): CronValidationResult {
  const fields = expression.trim().split(/\s+/);

  if (fields.length !== 5) {
    return {
      isValid: false,
      message: "Cron expression must have exactly 5 fields.",
    };
  }

  for (let index = 0; index < fields.length; index += 1) {
    const result = validateCronField(
      fields[index],
      FIELD_RULES[index].name,
      FIELD_RULES[index].min,
      FIELD_RULES[index].max,
    );

    if (!result.isValid) {
      return result;
    }
  }

  return {
    isValid: true,
    message: "Valid cron expression.",
  };
}

export function explainCronExpression(expression: string): string {
  const validation = validateCronExpression(expression);

  if (!validation.isValid) {
    return validation.message;
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression
    .trim()
    .split(/\s+/);

  if (
    minute === "*" &&
    hour === "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return "Every minute.";
  }

  if (
    isStep(minute) &&
    hour === "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Every ${minute.replace("*/", "")} minutes.`;
  }

  if (
    minute === "0" &&
    hour === "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return "Every hour.";
  }

  if (
    minute === "0" &&
    hour === "0" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return "Every day at midnight.";
  }

  if (
    isNumber(minute) &&
    isNumber(hour) &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Every day at ${formatTime(hour, minute)}.`;
  }

  if (
    isNumber(minute) &&
    isNumber(hour) &&
    dayOfMonth === "*" &&
    month === "*" &&
    isNumber(dayOfWeek)
  ) {
    return `Every ${formatDayOfWeek(dayOfWeek)} at ${formatTime(hour, minute)}.`;
  }

  if (
    isNumber(minute) &&
    isNumber(hour) &&
    isNumber(dayOfMonth) &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Every month on day ${dayOfMonth} at ${formatTime(hour, minute)}.`;
  }

  return `Runs with minute "${minute}", hour "${hour}", day of month "${dayOfMonth}", month "${month}", and day of week "${dayOfWeek}".`;
}

function validateCronField(
  field: string,
  fieldName: string,
  min: number,
  max: number,
): CronValidationResult {
  if (!field) {
    return {
      isValid: false,
      message: `${fieldName} cannot be empty.`,
    };
  }

  if (field === "*") {
    return {
      isValid: true,
      message: "Valid field.",
    };
  }

  const parts = field.split(",");

  for (const part of parts) {
    const result = validateCronPart(part, fieldName, min, max);

    if (!result.isValid) {
      return result;
    }
  }

  return {
    isValid: true,
    message: "Valid field.",
  };
}

function validateCronPart(
  part: string,
  fieldName: string,
  min: number,
  max: number,
): CronValidationResult {
  if (part.includes("/")) {
    const [base, step] = part.split("/");

    if (!base || !step || part.split("/").length !== 2) {
      return {
        isValid: false,
        message: `${fieldName} has an invalid step format.`,
      };
    }

    if (base !== "*" && !base.includes("-") && !isNumber(base)) {
      return {
        isValid: false,
        message: `${fieldName} has an invalid step base.`,
      };
    }

    if (!isNumber(step) || Number(step) <= 0) {
      return {
        isValid: false,
        message: `${fieldName} step must be a positive number.`,
      };
    }

    if (base.includes("-")) {
      return validateRange(base, fieldName, min, max);
    }

    if (isNumber(base)) {
      return validateNumber(base, fieldName, min, max);
    }

    return {
      isValid: true,
      message: "Valid field.",
    };
  }

  if (part.includes("-")) {
    return validateRange(part, fieldName, min, max);
  }

  return validateNumber(part, fieldName, min, max);
}

function validateRange(
  range: string,
  fieldName: string,
  min: number,
  max: number,
): CronValidationResult {
  const [start, end] = range.split("-");

  if (!start || !end || range.split("-").length !== 2) {
    return {
      isValid: false,
      message: `${fieldName} has an invalid range.`,
    };
  }

  const startResult = validateNumber(start, fieldName, min, max);

  if (!startResult.isValid) {
    return startResult;
  }

  const endResult = validateNumber(end, fieldName, min, max);

  if (!endResult.isValid) {
    return endResult;
  }

  if (Number(start) > Number(end)) {
    return {
      isValid: false,
      message: `${fieldName} range start cannot be greater than range end.`,
    };
  }

  return {
    isValid: true,
    message: "Valid field.",
  };
}

function validateNumber(
  value: string,
  fieldName: string,
  min: number,
  max: number,
): CronValidationResult {
  if (!isNumber(value)) {
    return {
      isValid: false,
      message: `${fieldName} must be a number, *, range, list, or step value.`,
    };
  }

  const numberValue = Number(value);

  if (numberValue < min || numberValue > max) {
    return {
      isValid: false,
      message: `${fieldName} must be between ${min} and ${max}.`,
    };
  }

  return {
    isValid: true,
    message: "Valid field.",
  };
}

function isNumber(value: string): boolean {
  return /^\d+$/.test(value);
}

function isStep(value: string): boolean {
  return /^\*\/\d+$/.test(value);
}

function formatTime(hour: string, minute: string): string {
  const hourNumber = Number(hour);
  const minuteText = minute.padStart(2, "0");
  const suffix = hourNumber >= 12 ? "PM" : "AM";
  const displayHour = hourNumber % 12 || 12;

  return `${displayHour}:${minuteText} ${suffix}`;
}

function formatDayOfWeek(day: string): string {
  const days: Record<string, string> = {
    "0": "Sunday",
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday",
    "7": "Sunday",
  };

  return days[day] || `day ${day}`;
}
