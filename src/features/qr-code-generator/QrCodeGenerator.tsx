import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import ToolActions from "../../components/tool/ToolActions";
import Button from "../../ui/Button";

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or URL to generate QR code..."
        className="w-full rounded-xl border border-border bg-surface p-4 text-sm text-primary outline-none min-h-[120px] resize-y"
      />

      {text.trim() && (
        <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border bg-surface">
          <div ref={svgRef}>
            <QRCodeSVG value={text} size={200} level="M" />
          </div>
        </div>
      )}

      <ToolActions>
        <Button variant="primary" onClick={handleDownload} disabled={!text.trim()}>
          Download SVG
        </Button>
        <Button variant="secondary" onClick={() => setText("")}>
          Clear
        </Button>
      </ToolActions>
    </div>
  );
}
