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

type Tab = "builder" | "reader" | "validator" | "examples";

const TABS: Tab[] = ["builder", "reader", "validator", "examples"];

const DEFAULT_FIELDS: CronFieldValues = {
  minute: "0",
  hour: "9",
  dayOfMonth: "*",
  month: "*",
  dayOfWeek: "*",
};

export default function CronGenerator() {
  const [activeTab, setActiveTab] = useState<Tab>("builder");
  const [fields, setFields] = useState<CronFieldValues>(DEFAULT_FIELDS);
  const [readerValue, setReaderValue] = useState("0 9 * * *");
  const [validatorValue, setValidatorValue] = useState("*/15 * * * *");

  const generatedExpression = useMemo(() => {
    return buildCronExpression(fields);
  }, [fields]);

  const generatedValidation = useMemo(() => {
    return validateCronExpression(generatedExpression);
  }, [generatedExpression]);

  const generatedExplanation = useMemo(() => {
    return explainCronExpression(generatedExpression);
  }, [generatedExpression]);

  const readerValidation = useMemo(() => {
    return validateCronExpression(readerValue);
  }, [readerValue]);

  const readerExplanation = useMemo(() => {
    return explainCronExpression(readerValue);
  }, [readerValue]);

  const validatorResult = useMemo(() => {
    return validateCronExpression(validatorValue);
  }, [validatorValue]);

  const updateField = (key: keyof CronFieldValues, value: string) => {
    setFields((currentFields) => ({
      ...currentFields,
      [key]: value,
    }));
  };

  const resetBuilder = () => {
    setFields(DEFAULT_FIELDS);
  };

  const useExample = (expression: string) => {
    const parts = expression.split(" ");

    setFields({
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    });

    setReaderValue(expression);
    setValidatorValue(expression);
    setActiveTab("builder");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-accent text-white"
                  : "bg-elevated text-secondary hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "builder" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-primary">Builder</h3>
              <p className="mt-1 text-sm text-secondary">
                Create a cron expression by editing each field.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <CronInput
                label="Minute"
                value={fields.minute}
                helper="0-59, *, */15"
                onChange={(value) => updateField("minute", value)}
              />
              <CronInput
                label="Hour"
                value={fields.hour}
                helper="0-23, *, */2"
                onChange={(value) => updateField("hour", value)}
              />
              <CronInput
                label="Day of month"
                value={fields.dayOfMonth}
                helper="1-31 or *"
                onChange={(value) => updateField("dayOfMonth", value)}
              />
              <CronInput
                label="Month"
                value={fields.month}
                helper="1-12 or *"
                onChange={(value) => updateField("month", value)}
              />
              <CronInput
                label="Day of week"
                value={fields.dayOfWeek}
                helper="0-7 or *"
                onChange={(value) => updateField("dayOfWeek", value)}
              />
            </div>
          </div>

          <ResultCard
            title="Generated cron expression"
            expression={generatedExpression}
            message={generatedExplanation}
            isValid={generatedValidation.isValid}
            validationMessage={generatedValidation.message}
            onReset={resetBuilder}
          />
        </div>
      )}

      {activeTab === "reader" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-primary">Reader</h3>
              <p className="mt-1 text-sm text-secondary">
                Paste a cron expression and read it in simple English.
              </p>
            </div>

            <input
              type="text"
              value={readerValue}
              onChange={(event) => setReaderValue(event.target.value)}
              placeholder="0 9 * * *"
              className="w-full rounded-lg border border-border bg-ground px-4 py-3 font-mono text-primary outline-none transition-colors focus:border-accent/50"
            />
          </div>

          <ResultCard
            title="Explanation"
            expression={readerValue}
            message={readerExplanation}
            isValid={readerValidation.isValid}
            validationMessage={readerValidation.message}
          />
        </div>
      )}

      {activeTab === "validator" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-primary">Validator</h3>
              <p className="mt-1 text-sm text-secondary">
                Check whether a cron expression is valid.
              </p>
            </div>

            <input
              type="text"
              value={validatorValue}
              onChange={(event) => setValidatorValue(event.target.value)}
              placeholder="*/15 * * * *"
              className="w-full rounded-lg border border-border bg-ground px-4 py-3 font-mono text-primary outline-none transition-colors focus:border-accent/50"
            />
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
            <p
              className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                validatorResult.isValid
                  ? "border-success-border bg-success-bg text-success"
                  : "border-danger-border bg-danger-bg text-danger"
              }`}
            >
              {validatorResult.message}
            </p>
          </div>
        </div>
      )}

      {activeTab === "examples" && (
        <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-primary">Examples</h3>
            <p className="mt-1 text-sm text-secondary">
              Pick a common cron schedule and use it in the builder.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CRON_EXAMPLES.map((example) => (
              <button
                key={example.expression}
                type="button"
                onClick={() => useExample(example.expression)}
                className="rounded-xl border border-border bg-ground p-4 text-left transition-colors hover:border-accent/50 hover:bg-elevated"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-primary">
                    {example.label}
                  </h4>
                  <code className="rounded-md bg-surface px-2 py-1 text-xs text-accent">
                    {example.expression}
                  </code>
                </div>
                <p className="text-sm text-secondary">{example.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type CronInputProps = {
  label: string;
  value: string;
  helper: string;
  onChange: (value: string) => void;
};

function CronInput({ label, value, helper, onChange }: CronInputProps) {
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
      <span className="mt-2 block text-xs text-muted">{helper}</span>
    </label>
  );
}

type ResultCardProps = {
  title: string;
  expression: string;
  message: string;
  isValid: boolean;
  validationMessage: string;
  onReset?: () => void;
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
    <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>

        <div className="flex gap-2">
          <CopyButton value={expression} />
          {onReset && (
            <Button onClick={onReset} variant="secondary">
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-ground p-4">
        <code className="block break-all font-mono text-lg text-accent">
          {expression}
        </code>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-elevated p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Explanation
          </p>
          <p className="text-sm text-primary">{message}</p>
        </div>

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
          <p
            className={isValid ? "text-sm text-success" : "text-sm text-danger"}
          >
            {validationMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
