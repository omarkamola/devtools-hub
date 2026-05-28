import { useState } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import ToolActions from "../../components/tool/ToolActions";
import CopyButton from "../../ui/CopyButton";
import SampleButton from "../../ui/SampleButton";
import Button from "../../ui/Button";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const hasInput = input.trim().length > 0;
  const canUseOutput = output.length > 0 && output !== "Invalid JSON format";

  function formatJson() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch {
      setOutput("Invalid JSON format");
    }
  }

  function loadSample() {
    const compact = '{"name":"DevToolsHub","version":"1.0.0"}';
    const parsed = JSON.parse(compact);

    setInput(compact);
    setOutput(JSON.stringify(parsed, null, 2));
  }

  function downloadJson() {
    if (!canUseOutput) {
      return;
    }

    const file = new Blob([output], {
      type: "application/json",
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "formatted.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  function clear() {
    setInput("");
    setOutput("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ToolTextarea
          label="Input"
          value={input}
          onChange={setInput}
          placeholder='Paste your JSON here, for example: {"name":"DevToolsHub"}'
          rows={15}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        <ToolTextarea
          label="Output"
          value={output}
          readOnly
          rows={15}
          textColor="accent"
        >
          {canUseOutput && (
            <CopyButton value={output} className="absolute right-4 top-4" />
          )}
        </ToolTextarea>
      </div>

      <div className="md:hidden sticky bottom-4 z-10 bg-surface/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg">
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={formatJson}
            isDisabled={!hasInput}
            className="flex-1"
          >
            Format JSON
          </Button>

          {canUseOutput && (
            <Button variant="secondary" onClick={downloadJson}>
              Download
            </Button>
          )}

          {output && (
            <Button variant="secondary" onClick={clear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <ToolActions>
          <Button variant="primary" onClick={formatJson} isDisabled={!hasInput}>
            Format JSON
          </Button>

          {canUseOutput && (
            <Button variant="secondary" onClick={downloadJson}>
              Download
            </Button>
          )}

          {output && (
            <Button variant="secondary" onClick={clear}>
              Clear
            </Button>
          )}
        </ToolActions>
      </div>
    </div>
  );
}
