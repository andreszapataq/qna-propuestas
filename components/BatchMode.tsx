"use client";

import { useState } from "react";
import type { ProposalData } from "@/lib/types";

type Status =
  | { kind: "idle" }
  | { kind: "info"; msg: string }
  | { kind: "success"; msg: string }
  | { kind: "error"; msg: string };

export function BatchMode() {
  const [rows, setRows] = useState<ProposalData[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    try {
      const { parseBatchFile } = await import("@/lib/batch-template");
      const parsed = await parseBatchFile(file);
      if (!parsed.length) {
        setStatus({ kind: "error", msg: "El archivo no tiene datos válidos" });
        setRows([]);
        return;
      }
      setRows(parsed);
      setStatus({ kind: "idle" });
      setProgress(null);
    } catch (err) {
      setStatus({ kind: "error", msg: err instanceof Error ? err.message : "No se pudo leer el archivo" });
    }
  };

  const handleTemplate = async () => {
    const { downloadXlsxTemplate } = await import("@/lib/batch-template");
    await downloadXlsxTemplate();
  };

  const handleGenerate = async () => {
    if (!rows.length) {
      setStatus({ kind: "error", msg: "No hay propuestas cargadas" });
      return;
    }
    setBusy(true);
    setProgress(0);
    const { buildPDF, proposalFileName } = await import("@/lib/pdf-generator");
    for (let i = 0; i < rows.length; i++) {
      const d = rows[i];
      const doc = await buildPDF(d);
      const fn = proposalFileName(d);
      doc.save(fn);
      setProgress(Math.round(((i + 1) / rows.length) * 100));
      setStatus({
        kind: "info",
        msg: `Generando ${fn} (${i + 1} de ${rows.length})`,
      });
      await new Promise((r) => setTimeout(r, 300));
    }
    setStatus({
      kind: "success",
      msg: `${rows.length} propuestas generadas exitosamente`,
    });
    setBusy(false);
  };

  return (
    <div>
      <section className="bg-card shadow-card mb-5 rounded-card border border-border p-6">
        <h2 className="font-display mb-4 border-b-2 border-primary-light pb-2.5 text-[18px] font-semibold text-primary-dark">
          Generación en bloque
        </h2>
        <p className="text-text-sec mb-4 text-[13px]">
          Descarga la plantilla Excel, llénala con los datos de cada propuesta, y súbela aquí para generar todos los PDFs de una vez.
        </p>

        <div className="mb-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleTemplate}
            className="shadow-btn-accent inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-accent to-accent-dark px-7 py-3 text-[14px] font-semibold text-white transition-transform hover:-translate-y-px"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            Descargar plantilla Excel
          </button>
        </div>

        <label
          className={`block cursor-pointer rounded-card border-2 border-dashed p-10 text-center transition-colors ${
            dragOver ? "border-primary bg-primary-light" : "border-border bg-bg hover:border-primary hover:bg-primary-light"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="text-primary mb-2 text-4xl">📄</div>
          <p className="text-text-sec text-[14px]">
            <strong>Arrastra tu archivo aquí</strong> o haz clic para seleccionar
          </p>
          <p className="text-text-tert mt-1 text-[12px]">.xlsx o .csv</p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </section>

      {rows.length > 0 && (
        <section className="bg-card shadow-card mb-5 rounded-card border border-border p-6">
          <h2 className="font-display mb-4 border-b-2 border-primary-light pb-2.5 text-[18px] font-semibold text-primary-dark">
            Propuestas a generar
          </h2>
          <div className="flex items-center gap-4 py-3">
            <span className="text-primary mr-2 text-2xl font-bold">{rows.length}</span>
            <span className="text-text-sec text-[14px]">propuestas detectadas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  {["#", "Institución", "Contacto", "Cargo", "Ciudad", "Tipo", "Descuento", "Pago"].map((h) => (
                    <th
                      key={h}
                      className="border-b-2 border-primary bg-primary-light px-2.5 py-2 text-left text-[11px] font-semibold uppercase text-primary-dark"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((d, i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-[#f9fafb]" : ""}>
                    <td className="border-b border-border px-2.5 py-1.5">{i + 1}</td>
                    <td className="border-b border-border px-2.5 py-1.5">
                      <strong>{d.institution}</strong>
                    </td>
                    <td className="border-b border-border px-2.5 py-1.5">{d.contactName}</td>
                    <td className="border-b border-border px-2.5 py-1.5">{d.contactRole}</td>
                    <td className="border-b border-border px-2.5 py-1.5">{d.city}</td>
                    <td className="border-b border-border px-2.5 py-1.5">{d.type}</td>
                    <td className="border-b border-border px-2.5 py-1.5">{d.discount}%</td>
                    <td className="border-b border-border px-2.5 py-1.5">{d.paymentTermsKey}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {progress != null && (
            <div className="my-4 h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {status.kind === "info" && (
            <div className="mb-3 rounded-lg bg-primary-light px-5 py-3 text-[13px] text-primary-dark">
              {status.msg}
            </div>
          )}
          {status.kind === "success" && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-accent-light px-5 py-3 text-[13px] text-[#006b4f]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <strong>{status.msg}</strong>
            </div>
          )}
          {status.kind === "error" && (
            <div className="mb-3 rounded-lg bg-danger-light px-5 py-3 text-[13px] text-danger">{status.msg}</div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={busy}
              className="shadow-btn-primary hover:shadow-btn-primary-hover inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-primary to-primary-dark px-7 py-3 text-[14px] font-semibold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              {busy ? "Generando…" : "Generar todos los PDFs"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
