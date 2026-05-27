import { useState } from "react";
import CopyButton from "../../ui/CopyButton";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";

// ── lorem ipsum corpus ──────────────────────────────────────────────────────

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
  "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore",
  "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam",
  "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
  "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur",
  "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
  "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
  "laborum", "perspiciatis", "unde", "omnis", "iste", "natus", "error",
  "voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem",
  "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
  "quasi", "architecto", "beatae", "vitae", "dicta", "explicabo", "nemo",
  "aspernatur", "aut", "odit", "fugit", "consequuntur", "magni", "dolores",
];

// ── helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWords(count: number): string {
  return Array.from({ length: count }, () => pick(WORDS)).join(" ");
}

function generateSentence(minWords = 6, maxWords = 14): string {
  const length = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words = Array.from({ length }, () => pick(WORDS));
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(minSentences = 3, maxSentences = 6): string {
  const count = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1));
  return Array.from({ length: count }, () => generateSentence()).join(" ");
}

type UnitType = "words" | "sentences" | "paragraphs";

function generate(unit: UnitType, count: number): string {
  switch (unit) {
    case "words":
      return generateWords(count);
    case "sentences":
      return Array.from({ length: count }, () => generateSentence()).join(" ");
    case "paragraphs":
      return Array.from({ length: count }, () => generateParagraph()).join("\n\n");
  }
}

// ── component ────────────────────────────────────────────────────────────────

const UNIT_OPTIONS: { label: string; value: UnitType }[] = [
  { label: "Words", value: "words" },
  { label: "Sentences", value: "sentences" },
  { label: "Paragraphs", value: "paragraphs" },
];

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<UnitType>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");

  const hasOutput = output.length > 0;

  function handleGenerate() {
    setOutput(generate(unit, count));
  }

  function clear() {
    setOutput("");
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4">
        {/* Unit selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Generate</span>
          <div className="flex overflow-hidden rounded-full border border-border">
            {UNIT_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setUnit(value)}
                className={`px-4 py-1.5 text-sm font-medium transition-all ${
                  unit === value
                    ? "bg-accent text-white"
                    : "bg-surface text-secondary hover:bg-elevated hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Count input */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Count</span>
          <input
            type="number"
            min={1}
            max={unit === "paragraphs" ? 20 : unit === "sentences" ? 100 : 500}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded-lg border border-border bg-surface px-3 py-1.5 text-center text-sm text-primary outline-none focus:border-accent/50"
          />
        </div>
      </div>

      {/* Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-secondary">Output</label>
          {hasOutput && <CopyButton value={output} />}
        </div>
        <textarea
          rows={14}
          readOnly
          value={output}
          placeholder="Generated text will appear here…"
          className="custom-scrollbar w-full rounded-xl border border-border bg-surface p-4 font-mono text-sm text-accent outline-none"
        />
      </div>

      <ToolActions>
        <Button variant="primary" onClick={handleGenerate}>
          Generate
        </Button>

        {hasOutput && (
          <Button variant="secondary" onClick={clear}>
            Clear
          </Button>
        )}
      </ToolActions>
    </div>
  );
}
