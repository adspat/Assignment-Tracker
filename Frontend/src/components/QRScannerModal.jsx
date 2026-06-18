import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const SCAN_COOLDOWN_MS = 2200;

const tk = {
  accent: "#F76605",
  accentSoft: "#FDE6D5",
  accentBorder: "#34473C",
  cardBorder: "rgba(52,71,60,0.25)",
  textPrimary: "#09050F",
  textSecondary: "#4A4651",
  textMuted: "#8B8791",
  metaBg: "#E8ECE9",
  danger: "#e5484d",
  dangerSoft: "rgba(229,72,77,0.08)",
  success: "#30a46c",
  successSoft: "rgba(48,164,108,0.10)",
};

const Spinner = () => (
  <span
    className="spin inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white"
    style={{ animation: "spin 0.7s linear infinite" }}
  />
);

const QRScannerModal = ({ onClose, onScan, isProcessing, error: externalError, successMessage }) => {
  const html5QrRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const processingRef = useRef(false);
  const lastScannedRef = useRef(null);
  const SCANNER_ID = "qr-scanner-container";

  const [camError, setCamError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(SCANNER_ID, { verbose: false });
      html5QrRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCamError("No camera found on this device.");
        return;
      }

      const backCam = cameras.find((c) =>
        c.label.toLowerCase().includes("back") ||
        c.label.toLowerCase().includes("rear") ||
        c.label.toLowerCase().includes("environment")
      ) || cameras[cameras.length - 1];

      await html5QrCode.start(
        backCam.id,
        {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          const text = decodedText.trim();
          if (!text || processingRef.current) return;

          const now = Date.now();
          const last = lastScannedRef.current;
          if (last?.text === text && now - last.time < SCAN_COOLDOWN_MS) return;

          lastScannedRef.current = { text, time: now };
          processingRef.current = true;

          if (navigator.vibrate) navigator.vibrate(100);

          Promise.resolve(onScan(text)).finally(() => {
            setTimeout(() => {
              processingRef.current = false;
            }, 500);
          });
        },
        () => {}
      );

      scannerStartedRef.current = true;
      setReady(true);
    } catch (err) {
      console.error("QR Scanner error:", err);
      if (err?.message?.toLowerCase().includes("permission")) {
        setCamError("Camera permission denied. Please allow camera access and try again.");
      } else if (err?.message?.toLowerCase().includes("notfound") || err?.message?.toLowerCase().includes("no camera")) {
        setCamError("No camera found on this device.");
      } else {
        setCamError("Could not start camera. Please try again.");
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current && scannerStartedRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (e) {
        console.error(e);
      }
      scannerStartedRef.current = false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  const displayError = externalError || camError;

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]" style={{ animation: "fadeIn 0.2s ease" }} />
      <div
        className="fixed left-1/2 top-1/2 z-[999] bg-white rounded-[22px] shadow-2xl w-[min(420px,calc(100vw-32px))]"
        style={{ animation: "slideUpCenter 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards", padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: tk.accentSoft, border: `1px solid ${tk.accent}` }}>
              <i className="ri-qr-scan-2-line" style={{ color: tk.textPrimary }} />
            </div>
            <div>
              <h2 className="m-0 text-[1.1rem] font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: tk.textPrimary }}>
                Scan QR Code
              </h2>
              <p className="mt-0.5 text-[0.68rem] font-medium" style={{ color: tk.textMuted }}>
                Scan continuously — camera stays on after each student
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer text-base hover:bg-black/10 transition-colors flex-shrink-0" style={{ backgroundColor: tk.metaBg, color: tk.textSecondary }}>
            <i className="ri-close-line" />
          </button>
        </div>

        <div
          className="rounded-2xl overflow-hidden mb-4 bg-black relative shadow-inner"
          style={{ aspectRatio: "1/1", minHeight: 260, border: `2px solid ${tk.cardBorder}` }}
        >
          <div id={SCANNER_ID} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

          {!ready && !camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <Spinner />
              <p className="mt-3 text-[0.78rem] font-semibold text-white/60">Starting camera…</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 py-2.5 bg-black/75 backdrop-blur-sm">
              <Spinner />
              <p className="text-[0.78rem] font-semibold text-white m-0">Updating status…</p>
            </div>
          )}

          {ready && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-5 left-5 w-7 h-7 border-t-[3px] border-l-[3px] rounded-tl-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div className="absolute top-5 right-5 w-7 h-7 border-t-[3px] border-r-[3px] rounded-tr-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div className="absolute bottom-5 left-5 w-7 h-7 border-b-[3px] border-l-[3px] rounded-bl-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div className="absolute bottom-5 right-5 w-7 h-7 border-b-[3px] border-r-[3px] rounded-br-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div
                className="absolute left-8 right-8 h-[2px] rounded-full"
                style={{ animation: "scanLine 2s ease-in-out infinite", backgroundImage: `linear-gradient(to right, transparent, ${tk.accent}, transparent)` }}
              />
            </div>
          )}

          {camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-3">
                <i className="ri-camera-off-line text-red-400 text-xl" />
              </div>
              <p className="text-[0.75rem] font-semibold text-white/80">{camError}</p>
            </div>
          )}
        </div>

        {successMessage && !camError ? (
          <p
            className="mb-4 text-[0.75rem] font-semibold flex items-center justify-center gap-1.5 border rounded-xl py-2.5 px-3"
            style={{ animation: "fadeIn 0.15s ease", backgroundColor: tk.successSoft, borderColor: "rgba(48,164,108,0.2)", color: tk.success }}
          >
            <i className="ri-checkbox-circle-fill text-sm" />
            {successMessage}
          </p>
        ) : displayError && !camError ? (
          <p
            className="mb-4 text-[0.75rem] font-semibold flex items-center justify-center gap-1.5 border rounded-xl py-2.5 px-3"
            style={{ animation: "fadeIn 0.15s ease", backgroundColor: tk.dangerSoft, borderColor: "rgba(229,72,77,0.2)", color: tk.danger }}
          >
            <i className="ri-error-warning-line text-sm" />
            {displayError}
          </p>
        ) : !camError ? (
          <p className="text-[0.68rem] text-center mb-4 flex items-center justify-center gap-1.5" style={{ color: tk.textMuted }}>
            <i className="ri-focus-3-line" style={{ color: tk.accentBorder }} />
            Point at a student QR — scanner stays open for the next scan
          </p>
        ) : (
          <div className="mb-4" />
        )}

        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-xl text-[0.82rem] font-semibold cursor-pointer transition-colors duration-150"
          style={{ backgroundColor: tk.metaBg, border: `1px solid ${tk.cardBorder}`, color: tk.textPrimary }}
        >
          Done Scanning
        </button>
      </div>
    </>
  );
};

export default QRScannerModal;
