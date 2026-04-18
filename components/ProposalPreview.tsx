"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import type { ProposalData } from "@/lib/types";
import { getProducts } from "@/lib/prices";
import { discountedPrice, fmt, ptLabel, todayStr } from "@/lib/format";

type Props = {
  data: ProposalData;
  onBack: () => void;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; file: string }
  | { kind: "error"; msg: string };

export function ProposalPreview({ data, onBack }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const products = getProducts(data.type);
  const paymentTerms = ptLabel(data.paymentTermsKey);

  const handleDownload = async () => {
    setStatus({ kind: "loading" });
    try {
      const { generateSinglePDF } = await import("@/lib/pdf-generator");
      const file = await generateSinglePDF(data);
      setStatus({ kind: "success", file });
    } catch (err) {
      setStatus({ kind: "error", msg: err instanceof Error ? err.message : "Error inesperado" });
    }
  };

  return (
    <section className="bg-card shadow-card mb-5 rounded-[10px] border border-border p-6">
      <h2 className="font-display mb-4 border-b-2 border-primary-light pb-2.5 text-[18px] font-semibold text-primary-dark">
        Vista previa de la propuesta
      </h2>

      <div className="min-h-[400px] rounded-lg border border-border bg-white p-10 text-[13px] leading-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="mb-6 border-b-2 border-primary pb-4 text-center">
          <Image src="/qna_logo.svg" alt="QNA Medical" width={236} height={77} className="mx-auto h-[50px] w-auto" />
        </div>

        <p className="text-text-sec mb-4 text-[12px]">{todayStr()}</p>

        <p>
          <strong>Señores</strong>
          <br />
          <strong>{data.institution || "[Institución]"}</strong>
          <br />
          Sr. {data.contactName || "[Nombre]"}
          <br />
          {data.contactRole || "[Cargo]"}
          <br />
          {data.city || "[Ciudad]"}
        </p>

        <p className="my-4 text-[13px] font-semibold text-primary-dark">
          Ref. Propuesta Económica de Aloinjertos Gold Standard
        </p>

        <div className="text-text-sec space-y-2 text-[12.5px]">
          <p>Cordial saludo,</p>
          <p>
            Agradecemos la oportunidad que nos brinda. Reconociendo la amplia trayectoria y experiencia de su prestigiosa institución, ponemos a su consideración nuestra propuesta técnica y económica de{" "}
            <strong>Aloinjertos Gold Standard</strong>.
          </p>
          <p>
            Los Aloinjertos suministrados por QNA Medical cuentan con procesos de esterilización de última generación y un contenido de hasta 100% de material biológico. Entre estas técnicas se destaca el método PASCO2.
          </p>
          <p>Quedamos atentos a cualquier información adicional que requieran.</p>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          Atentamente,
          <br />
          <br />
          <strong className="text-primary-dark">QNA MEDICAL</strong>
        </div>

        <hr className="my-6 border-none border-t-2 border-primary" />

        <p className="mb-2 text-[12px] font-semibold text-primary-dark">
          Tabla de precios de Aloinjertos para {data.institution || "[Institución]"}, por {paymentTerms}.
        </p>

        <table className="my-4 w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="bg-primary px-2 py-2 text-left text-[11px] text-white">Descripción</th>
              <th className="bg-primary px-2 py-2 text-right text-[11px] text-white">Precio</th>
              <th className="bg-primary px-2 py-2 text-right text-[11px] text-white">{data.discount}% DSCT</th>
            </tr>
          </thead>
          <tbody>
            {products.map((cat) => (
              <Fragment key={cat.cat}>
                <tr className="bg-primary-light font-semibold">
                  <td colSpan={3} className="px-2 py-1.5 text-[11px] text-primary-dark">
                    {cat.cat}
                  </td>
                </tr>
                {cat.items.map((item, idx) => {
                  const dp = discountedPrice(item.price, data.discount);
                  return (
                    <tr
                      key={`${cat.cat}-${item.name}`}
                      className={idx % 2 === 1 ? "bg-[#f9fafb]" : ""}
                    >
                      <td className="border-b border-[#eee] px-2 py-1.5 text-[11.5px]">{item.name}</td>
                      <td className="border-b border-[#eee] px-2 py-1.5 text-right text-[11.5px]">
                        {fmt(item.price)}
                      </td>
                      <td className="border-b border-[#eee] px-2 py-1.5 text-right text-[11.5px] font-semibold text-accent">
                        {fmt(dp)}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>

        <p className="text-text-sec mt-3 text-[11px]">
          <strong>Vigencia:</strong> 30 días calendario.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border-[1.5px] border-border bg-bg px-7 py-3 text-[14px] font-semibold text-text transition-colors hover:border-primary hover:bg-card"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={status.kind === "loading"}
          className="shadow-btn-primary hover:shadow-btn-primary-hover inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dark px-7 py-3 text-[14px] font-semibold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          {status.kind === "loading" ? "Generando…" : "Descargar PDF"}
        </button>
      </div>

      {status.kind === "success" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-light px-5 py-3 text-[13px] text-[#006b4f]">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          PDF generado: <strong>{status.file}</strong>
        </div>
      )}
      {status.kind === "error" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger-light px-5 py-3 text-[13px] text-danger">
          Error: {status.msg}
        </div>
      )}
    </section>
  );
}
