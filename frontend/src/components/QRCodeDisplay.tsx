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

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Get the SVG element
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    // Create print-friendly HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${treeName}</title>
          <style>
            @media print {
              @page {
                size: auto;
                margin: 20mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              text-align: center;
              max-width: 400px;
            }
            .qr-wrapper {
              background: white;
              padding: 30px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              margin-bottom: 20px;
              display: inline-block;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
              margin: 0 0 8px 0;
            }
            .subtitle {
              font-size: 14px;
              color: #6b7280;
              margin: 0 0 8px 0;
            }
            .url {
              font-size: 11px;
              color: #9ca3af;
              font-family: monospace;
              word-break: break-all;
              margin: 0;
            }
            .logo {
              margin-top: 30px;
              font-size: 18px;
              font-weight: bold;
              color: #48845C;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="qr-wrapper">
              ${svgData}
            </div>
            <h1>${treeName}</h1>
            <p class="subtitle">Scan this QR code to view tree details</p>
            <p class="url">${treeDetailUrl}</p>
            <div class="logo">Verdan</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Tree QR Code
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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
              <div className="bg-white p-3 sm:p-4 rounded-lg inline-block shadow-sm border border-gray-200 mb-3 sm:mb-4 max-w-full">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={treeDetailUrl}
                  size={Math.min(256, window.innerWidth - 120)}
                  level="H"
                  includeMargin={true}
                  style={{ display: "block", maxWidth: "100%", height: "auto" }}
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {treeName}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Scan this QR code to view tree details
                </p>
                <p className="text-xs text-gray-400 font-mono break-all px-2">
                  {treeDetailUrl}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2"
                  style={{ backgroundColor: "#48845C" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2"
                  style={{ backgroundColor: "#48845C" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
