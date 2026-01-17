import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface QRCodeDisplayProps {
  treeId: string;
  treeName: string;
  siteId: string;
  role?: string;
}

export default function QRCodeDisplay({
  treeId,
  treeName,
  siteId,
  role = "user",
}: QRCodeDisplayProps) {
  const [showModal, setShowModal] = useState(false);

  // Generate the URL for the public tree view page (works for both authenticated and non-authenticated users)
  const baseUrl = "https://verdan-beige.vercel.app";
  const treeDetailUrl = `${baseUrl}/tree/${treeId}`;

  const handleDownload = () => {
    // Get the SVG element
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (QR code size + padding for label)
    const qrSize = 256;
    const padding = 40;
    const labelHeight = 60;
    canvas.width = qrSize + padding * 2;
    canvas.height = qrSize + padding * 2 + labelHeight;

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      // Draw QR code
      ctx.drawImage(img, padding, padding, qrSize, qrSize);

      // Add tree name label
      ctx.fillStyle = "#000000";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(treeName, canvas.width / 2, qrSize + padding + 30);

      // Add small text
      ctx.font = "12px Arial";
      ctx.fillStyle = "#666666";
      ctx.fillText(
        "Scan to view tree details",
        canvas.width / 2,
        qrSize + padding + 50,
      );

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.download = `tree-${treeId}-qr.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <>
      {/* QR Code Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-5 py-2.5 text-sm font-medium border-2 rounded-lg transition-all hover:opacity-80 active:scale-95 whitespace-nowrap flex items-center gap-2"
        style={{
          borderColor: "#48845C",
          color: "#48845C",
          backgroundColor: "white",
        }}
        title="View QR Code"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
        QR Code
      </button>

      {/* QR Code Modal */}
      {showModal && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Tree QR Code</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block shadow-sm border border-gray-200 mb-4">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={treeDetailUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                  style={{ display: "block" }}
                />
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {treeName}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Scan this QR code to view tree details
                </p>
                <p className="text-xs text-gray-400 font-mono break-all">
                  {treeDetailUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "#48845C" }}
                >
                  Download QR Code
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
