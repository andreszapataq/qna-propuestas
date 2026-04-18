"use client";

import { Fragment } from "react";
import type { PaymentTermsKey, ProposalData } from "@/lib/types";
import { getProducts } from "@/lib/prices";
import { discountedPrice, fmt } from "@/lib/format";

type Props = {
  data: ProposalData;
  onChange: (patch: Partial<ProposalData>) => void;
  onBack: () => void;
  onNext: () => void;
};

export function ProductsTable({ data, onChange, onBack, onNext }: Props) {
  const products = getProducts(data.type);

  return (
    <section className="mb-5 rounded-card border border-border bg-card p-6 shadow-card">
      <h2 className="font-display mb-4 border-b-2 border-primary-light pb-2.5 text-[18px] font-semibold text-primary-dark">
        Productos y descuento
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-sec">Descuento ofrecido</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={50}
              value={data.discount}
              onChange={(e) =>
                onChange({
                  discount: Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)),
                })
              }
              className="w-20 rounded-lg border-[1.5px] border-border bg-bg px-3 py-2.5 text-center text-[14px] outline-none focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/10"
            />
            <span className="text-text-sec text-[14px]">%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-sec">Condición de pago</label>
          <select
            value={data.paymentTermsKey}
            onChange={(e) =>
              onChange({ paymentTermsKey: e.target.value as PaymentTermsKey })
            }
            className="cursor-pointer rounded-lg border-[1.5px] border-border bg-bg px-3.5 py-2.5 text-[14px] outline-none focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/10"
          >
            <option value="30">Pago a 30 días</option>
            <option value="60">Pago a 60 días</option>
            <option value="90">Pago a 90 días</option>
            <option value="contado">De contado</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="w-1/2 rounded-tl-lg bg-primary px-3 py-2.5 text-left text-[12px] font-medium uppercase tracking-wider text-white">
                Descripción
              </th>
              <th className="w-1/4 bg-primary px-3 py-2.5 text-right text-[12px] font-medium uppercase tracking-wider text-white">
                Precio lista
              </th>
              <th className="w-1/4 rounded-tr-lg bg-primary px-3 py-2.5 text-right text-[12px] font-medium uppercase tracking-wider text-white">
                Precio con descuento
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((cat) => (
              <Fragment key={cat.cat}>
                <tr className="bg-primary-light font-semibold text-primary-dark">
                  <td colSpan={3} className="px-3 py-2">
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
                      <td className="border-b border-border px-3 py-2">{item.name}</td>
                      <td className="whitespace-nowrap border-b border-border px-3 py-2 text-right tabular-nums">
                        {fmt(item.price)}
                      </td>
                      <td className="whitespace-nowrap border-b border-border px-3 py-2 text-right font-semibold tabular-nums text-accent">
                        {fmt(dp)}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border-[1.5px] border-border bg-bg px-7 py-3 text-[14px] font-semibold text-text transition-colors hover:border-primary hover:bg-card"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-primary to-primary-dark px-7 py-3 text-[14px] font-semibold text-white shadow-btn-primary transition-transform hover:-translate-y-px hover:shadow-btn-primary-hover"
        >
          Vista previa →
        </button>
      </div>
    </section>
  );
}
