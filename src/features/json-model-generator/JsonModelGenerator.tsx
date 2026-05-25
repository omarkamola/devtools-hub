import { useState } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import ToolActions from "../../components/tool/ToolActions";
import CopyButton from "../../ui/CopyButton";
import SampleButton from "../../ui/SampleButton";
import Button from "../../ui/Button";
import { generateModel } from "../../utils/jsonModelGenerator/generateModel";
import type { JsonModelLanguage } from "../../utils/jsonModelGenerator/types";

const SAMPLE_JSON = `{
  "id": 1,
  "name": "DevTools Hub",
  "isActive": true,
  "tags": ["tools", "developer"],
  "owner": {
    "name": "Shabeel",
    "role": "developer"
  }
}`;

export default function JsonModelGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [className, setClassName] = useState("RootModel");
  const [language, setLanguage] = useState<JsonModelLanguage>("typescript");

  const hasInput = input.trim().length > 0;
  const canUseOutput = output && output !== "Invalid JSON format";

  function handleGenerate() {
    try {
      const result = generateModel({
        input,
        className,
        language,
      });

      setOutput(result);
    } catch {
      setOutput("Invalid JSON format");
    }
  }

  function loadSample() {
    setInput(SAMPLE_JSON);

    try {
      const result = generateModel({
        input: SAMPLE_JSON,
        className,
        language,
      });

      setOutput(result);
    } catch {
      setOutput("Invalid JSON format");
    }
  }

  function downloadOutput() {
    if (!canUseOutput) {
      return;
    }

    const extension = language === "typescript" ? "ts" : "dart";

    const file = new Blob([output], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${className || "model"}.${extension}`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function clear() {
    setInput("");
    setOutput("");
    setClassName("RootModel");
    setLanguage("typescript");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-secondary">
              Model Name
            </span>

            <input
              type="text"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              placeholder="RootModel"
              className="w-full rounded-lg border border-border bg-ground px-4 py-3 font-mono text-primary outline-none transition-colors focus:border-accent/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-secondary">
              Output Language
            </span>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as JsonModelLanguage)
              }
              className="w-full rounded-lg border border-border bg-ground px-4 py-3 font-mono text-primary outline-none transition-colors focus:border-accent/50"
            >
              <option value="typescript">TypeScript Interface</option>
              <option value="dart">Dart Class</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ToolTextarea
          label="Input JSON"
          value={input}
          onChange={setInput}
          placeholder='Paste JSON here, for example { "name": "DevTools Hub" }'
          rows={15}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        <ToolTextarea
          label="Generated Model"
          value={output}
          readOnly
          rows={15}
          textColor="accent"
          rightLabel={canUseOutput ? <CopyButton value={output} /> : undefined}
        />
      </div>

      <ToolActions>
        <Button
          variant="primary"
          onClick={handleGenerate}
          isDisabled={!hasInput}
        >
          Generate Model
        </Button>

        {canUseOutput && (
          <Button variant="secondary" onClick={downloadOutput}>
            Download
          </Button>
        )}

        {(input || output) && (
          <Button variant="secondary" onClick={clear}>
            Clear
          </Button>
        )}
      </ToolActions>
    </div>
  );
}
