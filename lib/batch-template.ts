import type { PaymentTermsKey, ProposalData } from "./types";

const HEADERS = [
  "Institución",
  "Contacto",
  "Cargo",
  "Ciudad - Departamento",
  "Tipo (ips/distribuidor)",
  "Descuento (%)",
  "Condición de pago (30/60/90/contado)",
] as const;

const EXAMPLES: Array<string | number>[] = [
  ["Clínica La Estancia", "Luis Guillermo Gutierrez", "Jefe de Compras", "Popayan - Cauca", "ips", 10, "30"],
  ["Medical Neuro", "Jenny Rosero", "Gerente", "Ipiales - Nariño", "distribuidor", 15, "30"],
  [
    "Hospital Universitario San José de Popayan",
    "Juan Francisco Mora",
    "Jefe de Compras",
    "Popayan - Cauca",
    "ips",
    10,
    "60",
  ],
];

export async function downloadXlsxTemplate(): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([HEADERS as unknown as string[], ...EXAMPLES]);
  ws["!cols"] = [
    { wch: 38 },
    { wch: 26 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
    { wch: 34 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Propuestas");
  XLSX.writeFile(wb, "Plantilla_Propuestas_QNA.xlsx");
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeType(raw: string): ProposalData["type"] {
  return (raw || "").toLowerCase().includes("dist") ? "distribuidor" : "ips";
}

function normalizePaymentKey(raw: string): PaymentTermsKey {
  const v = (raw || "30").toString().trim().toLowerCase();
  if (v === "60" || v === "90" || v === "contado") return v;
  return "30";
}

function rowToProposal(values: (string | number | undefined)[]): ProposalData | null {
  const vals = values.map((v) => (v == null ? "" : String(v).trim()));
  if (vals.length < 4) return null;
  const institution = vals[0];
  const contactName = vals[1];
  if (!institution && !contactName) return null;
  return {
    institution,
    contactName,
    contactRole: vals[2] || "",
    city: vals[3] || "",
    type: normalizeType(vals[4] || ""),
    discount: Math.max(0, Math.min(50, parseFloat(vals[5] || "10") || 10)),
    paymentTermsKey: normalizePaymentKey(vals[6] || "30"),
    contactEmail: "",
    ccEmails: [],
  };
}

async function parseXlsx(file: File): Promise<ProposalData[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const firstSheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Array<string | number>>(firstSheet, { header: 1, blankrows: false });
  const out: ProposalData[] = [];
  for (let i = 1; i < rows.length; i++) {
    const p = rowToProposal(rows[i] ?? []);
    if (p) out.push(p);
  }
  return out;
}

async function parseCsv(file: File): Promise<ProposalData[]> {
  const text = await file.text();
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const out: ProposalData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const p = rowToProposal(parseCSVLine(lines[i]));
    if (p) out.push(p);
  }
  return out;
}

export async function parseBatchFile(file: File): Promise<ProposalData[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return parseXlsx(file);
  return parseCsv(file);
}
