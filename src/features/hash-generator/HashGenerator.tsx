import { useState, useEffect } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import CopyButton from "../../ui/CopyButton";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [isLive, setIsLive] = useState(true);

  const algorithms: Algorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  async function generateHash(text: string, algo: Algorithm) {
    if (!text) {
      setOutput("");
      return;
    }

    try {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setOutput(hashHex);
    } catch (err) {
      console.error("Hashing failed:", err);
      setOutput("Error generating hash");
    }
  }

  useEffect(() => {
    if (isLive) {
      generateHash(input, algorithm);
    }
  }, [input, algorithm, isLive]);

  function handleHashClick() {
    generateHash(input, algorithm);
  }

  function loadSample() {
    setInput("DevToolsHub is awesome!");
  }

  function clear() {
    setInput("");
    setOutput("");
  }

  return (
    <div className="space-y-8">
      {/* Algorithm Selection */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-neutral-400">Algorithm:</span>
        <div className="flex flex-wrap gap-2">
          {algorithms.map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                algorithm === algo
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
        
        <label className="ml-auto flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={isLive}
            onChange={(e) => setIsLive(e.target.checked)}
            className="size-4 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
          />
          <span className="text-sm text-neutral-400 group-hover:text-neutral-300">Live Mode</span>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <ToolTextarea
          label="Input Text"
          value={input}
          onChange={setInput}
          placeholder="Paste your text here..."
          rows={12}
          rightLabel={<SampleButton onClick={loadSample} />}
        />

        {/* Output */}
        <ToolTextarea
          label={`${algorithm} Hash Result`}
          value={output}
          readOnly
          rows={12}
          textColor="accent"
        >
          {output && (
            <CopyButton
              value={output}
              className="absolute right-4 top-4"
            />
          )}
        </ToolTextarea>
      </div>

      <ToolActions>
        {!isLive && (
          <Button onClick={handleHashClick} variant="primary" isDisabled={!input}>
            Generate Hash
          </Button>
        )}
        <Button onClick={clear} variant="secondary" isDisabled={!input && !output}>
          Clear
        </Button>
      </ToolActions>

      {/* Info Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
        <p>
          <strong>Privacy Note:</strong> All hashing is performed locally in your browser using the 
          <code className="mx-1 text-blue-400">Web Crypto API</code>. 
          Your input data never leaves your device.
        </p>
      </div>
    </div>
  );
}
