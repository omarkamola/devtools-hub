import { useState } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import CopyButton from "../../ui/CopyButton";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";

const SAMPLE_TEXT = "Hello, DevToolsHub!";

// ── helpers ────────────────────────────────────────────────────────────────

function textToBinary(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

function binaryToText(binary: string): string {
  const groups = binary.trim().split(/\s+/);
  return groups
    .map((group) => {
      if (!/^[01]+$/.test(group)) throw new Error("Invalid binary");
      return String.fromCharCode(parseInt(group, 2));
    })
    .join("");
}

// ── component ──────────────────────────────────────────────────────────────

export default function TextToBinaryConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const hasInput = input.trim().length > 0;
  const hasOutput = output.length > 0;

  function convert(direction: "encode" | "decode") {
    setError("");
    try {
      if (direction === "encode") {
        setOutput(textToBinary(input));
      } else {
        setOutput(binaryToText(input));
      }
    } catch {
      setOutput("");
      setError(
        direction === "decode"
          ? "Invalid binary input. Use space-separated 8-bit groups (e.g. 01001000 01101001)."
          : "Unable to convert text."
      );
    }
  }

  function loadSample() {
    setInput(SAMPLE_TEXT);
    setOutput(textToBinary(SAMPLE_TEXT));
    setError("");
  }

  function clear() {
    setInput("");
    setOutput("");
    setError("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ToolTextarea
          label="Input"
          value={input}
          onChange={(v) => {
            setInput(v);
            setError("");
          }}
          placeholder="Type text or paste binary (e.g. 01001000 01100101)…"
          rows={12}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        <ToolTextarea
          label="Output"
          value={error || output}
          readOnly
          rows={12}
          textColor={error ? "default" : "accent"}
        >
          {hasOutput && !error && (
            <CopyButton value={output} className="absolute right-4 top-4" />
          )}
        </ToolTextarea>
      </div>

      <ToolActions>
        <Button
          isDisabled={!hasInput}
          onClick={() => convert("encode")}
          variant="primary"
        >
          Text → Binary
        </Button>

        <Button
          isDisabled={!hasInput}
          onClick={() => convert("decode")}
          variant="primary"
        >
          Binary → Text
        </Button>

        {(hasOutput || error) && (
          <Button onClick={clear} variant="secondary">
            Clear
          </Button>
        )}
      </ToolActions>
    </div>
  );
}
