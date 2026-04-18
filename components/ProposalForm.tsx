"use client";

import type { ClientType, ProposalData } from "@/lib/types";

type Props = {
  data: ProposalData;
  onChange: (patch: Partial<ProposalData>) => void;
  ccEmails: string[];
  onCcChange: (emails: string[]) => void;
  onNext: () => void;
};

const inputBase =
  "font-sans text-[14px] px-3.5 py-2.5 border-[1.5px] border-border rounded-lg bg-bg text-text transition-all outline-none focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/10";

const labelBase = "text-[13px] font-medium text-text-sec";

export function ProposalForm({ data, onChange, ccEmails, onCcChange, onNext }: Props) {
  const addCc = () => onCcChange([...ccEmails, ""]);
  const updateCc = (i: number, v: string) =>
    onCcChange(ccEmails.map((e, idx) => (idx === i ? v : e)));
  const removeCc = (i: number) =>
    onCcChange(ccEmails.filter((_, idx) => idx !== i));

  return (
    <section className="bg-card shadow-card mb-5 rounded-[10px] border border-border p-6">
      <h2 className="font-display mb-4 border-b-2 border-primary-light pb-2.5 text-[18px] font-semibold text-primary-dark">
        Datos del cliente
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelBase}>Tipo de cliente</label>
          <select
            className={`${inputBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%228%22%3E%3Cpath%20d=%22M1%201l5%205%205-5%22%20stroke=%22%235a6270%22%20fill=%22none%22%20stroke-width=%221.5%22/%3E%3C/svg%3E')] bg-[position:right_14px_center] bg-no-repeat pr-10`}
            value={data.type}
            onChange={(e) => onChange({ type: e.target.value as ClientType })}
          >
            <option value="ips">Clínica / Hospital / IPS</option>
            <option value="distribuidor">Distribuidor</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelBase}>Nombre de la institución</label>
          <input
            className={inputBase}
            type="text"
            placeholder="Ej: Clínica La Estancia"
            value={data.institution}
            onChange={(e) => onChange({ institution: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelBase}>Contacto principal</label>
          <input
            className={inputBase}
            type="text"
            placeholder="Nombre completo"
            value={data.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelBase}>Cargo</label>
          <input
            className={inputBase}
            type="text"
            placeholder="Ej: Jefe de Compras"
            value={data.contactRole}
            onChange={(e) => onChange({ contactRole: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelBase}>Correo del destinatario</label>
          <input
            className={inputBase}
            type="email"
            placeholder="correo@institucion.com"
            value={data.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelBase}>Ciudad - Departamento</label>
          <input
            className={inputBase}
            type="text"
            placeholder="Ej: Popayan - Cauca"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>

        <div className="col-span-full flex flex-col gap-1.5">
          <label className={labelBase}>Correos en copia (CC)</label>
          <div className="space-y-2">
            {ccEmails.map((email, i) => (
              <div key={i} className="flex items-end gap-2">
                <input
                  className={`${inputBase} flex-1`}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => updateCc(i, e.target.value)}
                />
                {ccEmails.length > 1 && (
                  <button
                    type="button"
                    aria-label="Eliminar correo"
                    className="flex h-[38px] w-[34px] items-center justify-center rounded-md bg-danger-light text-[16px] text-danger"
                    onClick={() => removeCc(i)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 self-start py-1 text-[12px] font-medium text-primary hover:underline"
            onClick={addCc}
          >
            + Agregar otro correo en copia
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onNext}
          className="shadow-btn-primary hover:shadow-btn-primary-hover inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-dark px-7 py-3 text-[14px] font-semibold text-white transition-transform hover:-translate-y-px"
        >
          Siguiente →
        </button>
      </div>
    </section>
  );
}
