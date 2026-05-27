import { useState } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import CopyButton from "../../ui/CopyButton";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
} from "../../utils/textCaseTransformers";

const SAMPLE_TEXT =
  "the quick brown fox jumps over the lazy dog. Hello World from DevToolsHub!";

type CaseType =
  | "UPPERCASE"
  | "lowercase"
  | "Title Case"
  | "camelCase"
  | "PascalCase"
  | "snake_case"
  | "kebab-case";

const caseTransformers: Record<CaseType, (text: string) => string> = {
  UPPERCASE: toUpperCase,
  lowercase: toLowerCase,
  "Title Case": toTitleCase,
  camelCase: toCamelCase,
  PascalCase: toPascalCase,
  snake_case: toSnakeCase,
  "kebab-case": toKebabCase,
};

const caseOptions: CaseType[] = [
  "UPPERCASE",
  "lowercase",
  "Title Case",
  "camelCase",
  "PascalCase",
  "snake_case",
  "kebab-case",
];

export default function TextCaseModifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseType | null>(null);

  const hasInput = input.trim().length > 0;
  const hasOutput = output.length > 0;

  function applyCase(caseType: CaseType) {
    if (!hasInput) return;
    setActiveCase(caseType);
    setOutput(caseTransformers[caseType](input));
  }

  function handleInputChange(value: string) {
    setInput(value);
    // Re-apply the active transformation when input changes
    if (activeCase && value.trim().length > 0) {
      setOutput(caseTransformers[activeCase](value));
    } else {
      setOutput("");
    }
  }

  function loadSample() {
    setInput(SAMPLE_TEXT);
    setActiveCase(null);
    setOutput("");
  }

  function clear() {
    setInput("");
    setOutput("");
    setActiveCase(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ToolTextarea
          label="Input"
          value={input}
          onChange={handleInputChange}
          placeholder="Paste or type your text here..."
          rows={12}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        <ToolTextarea
          label="Output"
          value={output}
          readOnly
          rows={12}
          textColor="accent"
        >
          {hasOutput && (
            <CopyButton
              value={output}
              className="absolute right-4 top-4"
            />
          )}
        </ToolTextarea>
      </div>

      <ToolActions className="flex-wrap">
        {caseOptions.map((caseType) => (
          <Button
            key={caseType}
            isDisabled={!hasInput}
            onClick={() => applyCase(caseType)}
            variant={activeCase === caseType ? "primary" : "secondary"}
          >
            {caseType}
          </Button>
        ))}
      </ToolActions>

      <ToolActions>
        {hasOutput && (
          <Button onClick={clear} variant="secondary">
            Clear
          </Button>
        )}
      </ToolActions>
    </div>
  );
}
