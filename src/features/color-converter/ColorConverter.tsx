import { useState, useMemo } from "react";
import ToolTextarea from "../../components/tool/ToolTextarea";
import ToolActions from "../../components/tool/ToolActions";
import CopyButton from "../../ui/CopyButton";
import Button from "../../ui/Button";
import SampleButton from "../../ui/SampleButton";

// ── types ───────────────────────────────────────────────────────────────────

interface ParsedColor {
  hex: string; // #rrggbb
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

// ── CSS named colors (subset) ───────────────────────────────────────────────

const NAMED_COLORS: Record<string, string> = {
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  white: "#ffffff",
  black: "#000000",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  maroon: "#800000",
  purple: "#800080",
  fuchsia: "#ff00ff",
  lime: "#00ff00",
  olive: "#808000",
  yellow: "#ffff00",
  navy: "#000080",
  teal: "#008080",
  aqua: "#00ffff",
  orange: "#ffa500",
  coral: "#ff7f50",
  tomato: "#ff6347",
  orangered: "#ff4500",
  gold: "#ffd700",
  khaki: "#f0e68c",
  violet: "#ee82ee",
  plum: "#dda0dd",
  pink: "#ffc0cb",
  hotpink: "#ff69b4",
  deepskyblue: "#00bfff",
  dodgerblue: "#1e90ff",
  royalblue: "#4169e1",
  cornflowerblue: "#6495ed",
  lightblue: "#add8e6",
  darkblue: "#00008b",
  midnightblue: "#191970",
  indigo: "#4b0082",
  darkred: "#8b0000",
  firebrick: "#b22222",
  crimson: "#dc143c",
  salmon: "#fa8072",
  lightcoral: "#f08080",
  darkorange: "#ff8c00",
  chocolate: "#d2691e",
  peru: "#cd853f",
  sienna: "#a0522d",
  saddlebrown: "#8b4513",
  brown: "#a52a2a",
  rosybrown: "#bc8f8f",
  tan: "#d2b48c",
  burlywood: "#deb887",
  wheat: "#f5deb3",
  beige: "#f5f5dc",
  mintcream: "#f5fffa",
  honeydew: "#f0fff0",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  mistyrose: "#ffe4e1",
  azure: "#f0ffff",
  aliceblue: "#f0f8ff",
  ghostwhite: "#f8f8ff",
  whitesmoke: "#f5f5f5",
  seashell: "#fff5ee",
  oldlace: "#fdf5e6",
  floralwhite: "#fffaf0",
  ivory: "#fffff0",
  linen: "#faf0e6",
  snow: "#fffafa",
  lightyellow: "#ffffe0",
  lightgoldenrodyellow: "#fafad2",
  lemonchiffon: "#fffacd",
  papayawhip: "#ffefd5",
  moccasin: "#ffe4b5",
  peachpuff: "#ffdab9",
  palegoldenrod: "#eee8aa",
  darkkhaki: "#bdb76b",
  lightgreen: "#90ee90",
  palegreen: "#98fb98",
  springgreen: "#00ff7f",
  mediumspringgreen: "#00fa9a",
  lawngreen: "#7cfc00",
  chartreuse: "#7fff00",
  greenyellow: "#adff2f",
  limegreen: "#32cd32",
  yellowgreen: "#9acd32",
  forestgreen: "#228b22",
  darkgreen: "#006400",
  seagreen: "#2e8b57",
  mediumseagreen: "#3cb371",
  darkseagreen: "#8fbc8f",
  lightseagreen: "#20b2aa",
  mediumaquamarine: "#66cdaa",
  aquamarine: "#7fffd4",
  turquoise: "#40e0d0",
  mediumturquoise: "#48d1cc",
  darkturquoise: "#00ced1",
  paleturquoise: "#afeeee",
  cyan: "#00ffff",
  darkcyan: "#008b8b",
  cadetblue: "#5f9ea0",
  powderblue: "#b0e0e6",
  skyblue: "#87ceeb",
  lightskyblue: "#87cefa",
  steelblue: "#4682b4",
  mediumblue: "#0000cd",
  slateblue: "#6a5acd",
  mediumslateblue: "#7b68ee",
  darkslateblue: "#483d8b",
  rebeccapurple: "#663399",
  mediumpurple: "#9370db",
  darkorchid: "#9932cc",
  darkviolet: "#9400d3",
  mediumorchid: "#ba55d3",
  orchid: "#da70d6",
  thistle: "#d8bfd8",
  magenta: "#ff00ff",
  mediumvioletred: "#c71585",
  palevioletred: "#db7093",
  deeppink: "#ff1493",
  lightpink: "#ffb6c1",
  darkgray: "#a9a9a9",
  darkgrey: "#a9a9a9",
  lightgray: "#d3d3d3",
  lightgrey: "#d3d3d3",
  dimgray: "#696969",
  dimgrey: "#696969",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  slategray: "#708090",
  slategrey: "#708090",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
};

// ── parsing helpers ─────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

function rgbStringToObj(rgb: string): { r: number; g: number; b: number } | null {
  // matches: rgb(123, 45, 67) or rgba(123, 45, 67, 1)
  const match = rgb.match(
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/,
  );
  if (!match) return null;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  if (r > 255 || g > 255 || b > 255) return null;
  return { r, g, b };
}

function hslStringToObj(hsl: string): { h: number; s: number; l: number } | null {
  // matches: hsl(240, 100%, 50%) or hsla(240, 100%, 50%, 1)
  const match = hsl.match(
    /hsla?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%/,
  );
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  const l = parseInt(match[3], 10);
  if (h > 360 || s > 100 || l > 100) return null;
  return { h, s, l };
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      break;
    case g:
      h = ((b - r) / d + 2) * 60;
      break;
    case b:
      h = ((r - g) / d + 4) * 60;
      break;
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// ── parse input ─────────────────────────────────────────────────────────────

function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try HEX
  if (/^#?[0-9a-fA-F]{3,6}$/.test(trimmed)) {
    const rgb = hexToRgb(trimmed);
    if (!rgb) return null;
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl: rgbToHsl(rgb.r, rgb.g, rgb.b) };
  }

  // Try rgb/rgba
  const rgbObj = rgbStringToObj(trimmed);
  if (rgbObj) {
    const hex = rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);
    return { hex, rgb: rgbObj, hsl: rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b) };
  }

  // Try hsl/hsla
  const hslObj = hslStringToObj(trimmed);
  if (hslObj) {
    const rgb = hslToRgb(hslObj.h, hslObj.s, hslObj.l);
    return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb, hsl: hslObj };
  }

  // Try CSS named color
  const lower = trimmed.toLowerCase();
  if (NAMED_COLORS[lower]) {
    const rgb = hexToRgb(NAMED_COLORS[lower]);
    if (!rgb) return null;
    return {
      hex: NAMED_COLORS[lower].toUpperCase(),
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
    };
  }

  return null;
}

// ── sample ──────────────────────────────────────────────────────────────────

const SAMPLES = [
  { name: "Coral", value: "#FF7F50" },
  { name: "Steel Blue", value: "#4682B4" },
  { name: "rgb(255, 215, 0)", value: "rgb(255, 215, 0)" },
  { name: "hsl(280, 100%, 50%)", value: "hsl(280, 100%, 50%)" },
  { name: "RebeccaPurple", value: "rebeccapurple" },
];

// ── component ───────────────────────────────────────────────────────────────

export default function ColorConverter() {
  const [input, setInput] = useState("");
  const [sampleIndex, setSampleIndex] = useState(0);

  const parsed = useMemo(() => parseColor(input), [input]);
  const hasInput = input.trim().length > 0;

  function loadSample() {
    const s = SAMPLES[sampleIndex % SAMPLES.length];
    setInput(s.value);
    setSampleIndex((i) => i + 1);
  }

  function clear() {
    setInput("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <ToolTextarea
            label="Input"
            value={input}
            onChange={setInput}
            placeholder='Enter a color, e.g. #FF7F50, rgb(255,127,80), hsl(16,100%,66%), or coral'
            rows={4}
            rightLabel={<SampleButton onClick={loadSample} />}
          />

          {parsed && (
            <div
              className="h-20 rounded-xl border border-border transition-colors"
              style={{ backgroundColor: parsed.hex }}
            />
          )}
        </div>

        <div className="space-y-3">
          {parsed ? (
            <>
              {/* HEX */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <div>
                  <span className="text-xs font-medium text-secondary">HEX</span>
                  <p className="font-mono text-sm text-accent">{parsed.hex}</p>
                </div>
                <CopyButton value={parsed.hex} />
              </div>

              {/* RGB */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <div>
                  <span className="text-xs font-medium text-secondary">RGB</span>
                  <p className="font-mono text-sm text-accent">
                    rgb({parsed.rgb.r}, {parsed.rgb.g}, {parsed.rgb.b})
                  </p>
                </div>
                <CopyButton
                  value={`rgb(${parsed.rgb.r}, ${parsed.rgb.g}, ${parsed.rgb.b})`}
                />
              </div>

              {/* HSL */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <div>
                  <span className="text-xs font-medium text-secondary">HSL</span>
                  <p className="font-mono text-sm text-accent">
                    hsl({parsed.hsl.h}, {parsed.hsl.s}%, {parsed.hsl.l}%)
                  </p>
                </div>
                <CopyButton
                  value={`hsl(${parsed.hsl.h}, ${parsed.hsl.s}%, ${parsed.hsl.l}%)`}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-sm text-muted">
                {hasInput
                  ? "Could not parse that color."
                  : "Enter a color to see converted values."}
              </p>
            </div>
          )}
        </div>
      </div>

      {(hasInput || parsed) && (
        <ToolActions>
          <span className="text-xs text-muted self-center">
            Try:{" "}
            {SAMPLES.map((s, i) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setInput(s.value)}
                className="ml-1 text-accent hover:underline"
              >
                {s.name}{i < SAMPLES.length - 1 ? "," : ""}
              </button>
            ))}
          </span>
          <Button variant="secondary" onClick={clear}>
            Clear
          </Button>
        </ToolActions>
      )}
    </div>
  );
}
