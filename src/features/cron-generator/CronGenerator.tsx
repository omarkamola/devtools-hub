import { useMemo, useState } from "react";
import Button from "../../ui/Button";
import CopyButton from "../../ui/CopyButton";
import {
  buildCronExpression,
  CRON_EXAMPLES,
  explainCronExpression,
  validateCronExpression,
  type CronFieldValues,
} from "../../utils/cron/cron";

const DEFAULT_FIELDS: CronFieldValues = {
  minute: "0",
  hour: "9",
  dayOfMonth: "*",
  month: "*",
  dayOfWeek: "*",
};

const FIELD_HELPERS = {
  minute: [
    "0 = at the start of the hour",
    "*/15 = every 15 minutes",
    "* = every minute",
  ],
  hour: ["9 = at 9 AM", "*/2 = every 2 hours", "* = every hour"],
  dayOfMonth: ["1 = on the 1st day", "15 = on the 15th day", "* = every day"],
  month: ["1 = January", "6 = June", "* = every month"],
  dayOfWeek: ["1 = Monday", "5 = Friday", "* = every weekday"],
};

export default function CronGenerator() {
  const [fields, setFields] = useState<CronFieldValues>(DEFAULT_FIELDS);
  const [manualExpression, setManualExpression] = useState("0 9 * * *");

  const generatedExpression = useMemo(() => {
    return buildCronExpression(fields);
  }, [fields]);

  const generatedValidation = useMemo(() => {
    return validateCronExpression(generatedExpression);
  }, [generatedExpression]);

  const generatedExplanation = useMemo(() => {
    return explainCronExpression(generatedExpression);
  }, [generatedExpression]);

  const manualValidation = useMemo(() => {
    return validateCronExpression(manualExpression);
  }, [manualExpression]);

  const manualExplanation = useMemo(() => {
    return explainCronExpression(manualExpression);
  }, [manualExpression]);

  const updateField = (key: keyof CronFieldValues, value: string) => {
    setFields((currentFields) => ({
      ...currentFields,
      [key]: value,
    }));
  };

  const resetBuilder = () => {
    setFields(DEFAULT_FIELDS);
    setManualExpression(buildCronExpression(DEFAULT_FIELDS));
  };

  const useExample = (expression: string) => {
    const parts = expression.split(" ");

    if (parts.length !== 5) return;

    setFields({
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    });

    setManualExpression(expression);
  };

  const applyManualExpression = () => {
    const parts = manualExpression.trim().split(/\s+/);

    if (parts.length !== 5 || !manualValidation.isValid) return;

    setFields({
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-4 md:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-primary">
            Quick schedules
          </h3>
          <p className="mt-1 text-sm text-secondary">
            Pick a common schedule, then adjust it if needed.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CRON_EXAMPLES.slice(0, 6).map((example) => (
            <button
              key={example.expression}
              type="button"
              onClick={() => useExample(example.expression)}
              className="rounded-xl border border-border bg-ground p-4 text-left transition-colors hover:border-accent/50 hover:bg-elevated"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold text-primary">{example.label}</h4>
                <code className="rounded-md bg-surface px-2 py-1 text-xs text-accent">
                  {example.expression}
                </code>
              </div>
              <p className="text-sm text-secondary">{example.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 md:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-primary">
            Custom schedule
          </h3>
          <p className="mt-1 text-sm text-secondary">
            Change the parts below to build your own schedule.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <CronInput
            label="Minute"
            value={fields.minute}
            examples={FIELD_HELPERS.minute}
            onChange={(value) => updateField("minute", value)}
          />
          <CronInput
            label="Hour"
            value={fields.hour}
            examples={FIELD_HELPERS.hour}
            onChange={(value) => updateField("hour", value)}
          />
          <CronInput
            label="Date in month"
            value={fields.dayOfMonth}
            examples={FIELD_HELPERS.dayOfMonth}
            onChange={(value) => updateField("dayOfMonth", value)}
          />
          <CronInput
            label="Month"
            value={fields.month}
            examples={FIELD_HELPERS.month}
            onChange={(value) => updateField("month", value)}
          />
          <CronInput
            label="Weekday"
            value={fields.dayOfWeek}
            examples={FIELD_HELPERS.dayOfWeek}
            onChange={(value) => updateField("dayOfWeek", value)}
          />
        </div>
      </section>

      <ResultCard
        title="Your cron expression"
        expression={generatedExpression}
        message={generatedExplanation}
        isValid={generatedValidation.isValid}
        validationMessage={generatedValidation.message}
        onReset={resetBuilder}
      />
    </div>
  );
}

type CronInputProps = {
  label: string;
  value: string;
  examples: string[];
  onChange: (value: string) => void;
};

function CronInput({ label, value, examples, onChange }: CronInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-primary">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-ground px-3 py-2 font-mono text-primary outline-none transition-colors focus:border-accent/50"
      />
      <span className="mt-2 block space-y-1 text-xs text-muted">
        {examples.map((example) => (
          <span key={example} className="block">
            {example}
          </span>
        ))}
      </span>
    </label>
  );
}

type ResultCardProps = {
  title: string;
  expression: string;
  message: string;
  isValid: boolean;
  validationMessage: string;
  onReset: () => void;
};

function ResultCard({
  title,
  expression,
  message,
  isValid,
  validationMessage,
  onReset,
}: ResultCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>

        <div className="flex gap-2">
          <CopyButton value={expression} />
          <Button onClick={onReset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-ground p-4">
        <code className="block break-all font-mono text-lg text-accent">
          {expression}
        </code>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoBox title="Explanation" message={message} />
        <ValidationBox isValid={isValid} message={validationMessage} />
      </div>
    </section>
  );
}

type InfoBoxProps = {
  title: string;
  message: string;
};

function InfoBox({ title, message }: InfoBoxProps) {
  return (
    <div className="rounded-lg border border-border bg-elevated p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
        {title}
      </p>
      <p className="text-sm text-primary">{message}</p>
    </div>
  );
}

type ValidationBoxProps = {
  isValid: boolean;
  message: string;
};

function ValidationBox({ isValid, message }: ValidationBoxProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isValid
          ? "border-success-border bg-success-bg"
          : "border-danger-border bg-danger-bg"
      }`}
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
        Validation
      </p>
      <p className={isValid ? "text-sm text-success" : "text-sm text-danger"}>
        {message}
      </p>
    </div>
  );
}
