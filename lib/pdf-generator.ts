import { jsPDF } from "jspdf";
import autoTable, { type CellHookData } from "jspdf-autotable";
import type { ProposalData } from "./types";
import { getProducts } from "./prices";
import { cleanFileName, discountedPrice, ptLabel, todayStr } from "./format";

let cachedLogoPng: string | null = null;
let cachedSignaturePng: string | null = null;

async function getSignaturePng(): Promise<string | null> {
  if (cachedSignaturePng) return cachedSignaturePng;
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/victor_signature.png");
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("signature load failed"));
      reader.readAsDataURL(blob);
    });
    cachedSignaturePng = dataUrl;
    return cachedSignaturePng;
  } catch {
    return null;
  }
}

async function getLogoPng(): Promise<string | null> {
  if (cachedLogoPng) return cachedLogoPng;
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/qna_logo.svg");
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("logo load failed"));
      img.src = url;
    });
    const scale = 4;
    const canvas = document.createElement("canvas");
    canvas.width = 235.81 * scale;
    canvas.height = 76.61 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    cachedLogoPng = canvas.toDataURL("image/png");
    return cachedLogoPng;
  } catch {
    return null;
  }
}

type Segment = { text: string; bold: boolean };

const BODY_PARAGRAPHS: Segment[][] = [
  [{ text: "Cordial saludo,", bold: false }],
  [],
  [
    {
      text: "Agradecemos la oportunidad que nos brinda. Reconociendo la amplia trayectoria y experiencia de su prestigiosa institución, ponemos a su consideración nuestra propuesta técnica y económica de Biológicos Gold Standard, reconocidos por su alto desempeño en el mercado global, contamos con presentaciones como ",
      bold: false,
    },
    { text: "Putty", bold: true },
    { text: ", ", bold: false },
    { text: "Chips", bold: true },
    { text: ", ", bold: false },
    { text: "Bloque Tricortical", bold: true },
    { text: ", ", bold: false },
    { text: "Cabeza Femoral", bold: true },
    { text: ", ", bold: false },
    { text: "Lajas", bold: true },
    { text: ", ", bold: false },
    { text: "Tendones", bold: true },
    { text: ", ", bold: false },
    { text: "Vidrio Bioactivo y Parche Duramadre", bold: true },
    { text: ".", bold: false },
  ],
  [],
  [
    {
      text: "Los Biológicos suministrados por QNA Medical cuentan con procesos de esterilización de última generación y un contenido de hasta 100% de material biológico. Entre estos procesos se destacan el ",
      bold: false,
    },
    { text: "eBeam®", bold: true },
    { text: " y ", bold: false },
    { text: "PASCO2®", bold: true },
    {
      text: ", utilizando electrones de alta potencia o dióxido de carbono supercrítico para eliminar de manera efectiva los microorganismos patógenos presentes en el material, garantizando la eliminación de cualquier tipo de contaminación microbiana. Este proceso asegura un alto potencial biológico, así como mayor seguridad para los pacientes y el personal médico.",
      bold: false,
    },
  ],
  [],
  [
    {
      text: "Nuestra misión es comercializar y distribuir productos de la más alta calidad, incluidos sistemas de ",
      bold: false,
    },
    {
      text: "Trauma, Fijación Externa, Reemplazos Articulares y Medicina Deportiva",
      bold: true,
    },
    {
      text: ", orientados al tratamiento de afecciones degenerativas, traumáticas y deformidades, con aplicaciones en las áreas ortopédica, neurológica, odontológica y maxilofacial.",
      bold: false,
    },
  ],
  [],
  [
    {
      text: "Quedamos atentos a cualquier información adicional que requieran y a la posibilidad de establecer una relación comercial sólida y duradera.",
      bold: false,
    },
  ],
];

type WordChunk = { text: string; bold: boolean };
type ParaWord = { chunks: WordChunk[]; width: number };

function tokenizeSegments(segments: Segment[], doc: jsPDF): ParaWord[] {
  const words: ParaWord[] = [];
  let current: WordChunk[] = [];

  const flush = () => {
    if (current.length === 0) return;
    let width = 0;
    for (const c of current) {
      doc.setFont("helvetica", c.bold ? "bold" : "normal");
      width += doc.getTextWidth(c.text);
    }
    words.push({ chunks: current, width });
    current = [];
  };

  for (const seg of segments) {
    const parts = seg.text.split(/( +)/);
    for (const part of parts) {
      if (part === "") continue;
      if (/^ +$/.test(part)) {
        flush();
      } else if (current.length > 0 && current[current.length - 1].bold === seg.bold) {
        current[current.length - 1].text += part;
      } else {
        current.push({ text: part, bold: seg.bold });
      }
    }
  }
  flush();
  return words;
}

function renderJustifiedParagraph(
  doc: jsPDF,
  segments: Segment[],
  x: number,
  startY: number,
  maxWidth: number,
  lineH: number,
): number {
  if (segments.length === 0) return startY;
  const words = tokenizeSegments(segments, doc);
  if (words.length === 0) return startY;

  doc.setFont("helvetica", "normal");
  const spaceWidth = doc.getTextWidth(" ");

  type Line = { words: ParaWord[]; naturalWidth: number };
  const lines: Line[] = [];
  let buf: ParaWord[] = [];
  let bufW = 0;
  for (const word of words) {
    const trial = buf.length === 0 ? word.width : bufW + spaceWidth + word.width;
    if (trial > maxWidth && buf.length > 0) {
      lines.push({ words: buf, naturalWidth: bufW });
      buf = [word];
      bufW = word.width;
    } else {
      buf.push(word);
      bufW = trial;
    }
  }
  if (buf.length > 0) lines.push({ words: buf, naturalWidth: bufW });

  let y = startY;
  lines.forEach((line, i) => {
    const isLast = i === lines.length - 1;
    let gap = spaceWidth;
    if (!isLast && line.words.length > 1) {
      const totalWordWidth = line.words.reduce((s, w) => s + w.width, 0);
      gap = (maxWidth - totalWordWidth) / (line.words.length - 1);
    }
    let cx = x;
    line.words.forEach((word, wi) => {
      for (const chunk of word.chunks) {
        doc.setFont("helvetica", chunk.bold ? "bold" : "normal");
        doc.text(chunk.text, cx, y);
        cx += doc.getTextWidth(chunk.text);
      }
      if (wi < line.words.length - 1) cx += gap;
    });
    y += lineH;
  });
  doc.setFont("helvetica", "normal");
  return y;
}

export async function buildPDF(data: ProposalData): Promise<jsPDF> {
  const products = getProducts(data.type);
  const paymentTerms = ptLabel(data.paymentTermsKey);
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mL = 25;
  const mR = 25;
  const cW = pageW - mL - mR;

  const addFooter = (pg: number, total: number) => {
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.setFont("helvetica", "normal");
    doc.text("Carrera 46 No 95 – 09 Tel. (605) 304 9756", pageW / 2, pageH - 12, { align: "center" });
    doc.text("Barranquilla – Colombia", pageW / 2, pageH - 8, { align: "center" });
    doc.text(`Página ${pg} de ${total}`, pageW - mR, pageH - 12, { align: "right" });
  };

  const logo = await getLogoPng();
  if (logo) {
    try {
      doc.addImage(logo, "PNG", mL, 12, 55, 18);
    } catch {
      // silent fallback — continue without logo
    }
  }

  doc.setDrawColor(0, 113, 169);
  doc.setLineWidth(0.5);
  doc.line(mL, 34, pageW - mR, 34);

  let y = 44;
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(todayStr(), mL, y);
  y += 14;

  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text("Señores", mL, y);
  y += 6;
  doc.text((data.institution || "").toUpperCase(), mL, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Sr. ${data.contactName || ""}`, mL, y);
  y += 5;
  doc.text(data.contactRole || "", mL, y);
  y += 5;
  doc.text(data.city || "", mL, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 85, 128);
  doc.text("Ref. Propuesta Económica de Aloinjertos Gold Standard", mL, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(50);
  doc.setFontSize(10);

  BODY_PARAGRAPHS.forEach((p) => {
    if (p.length === 0) {
      y += 4;
      return;
    }
    y = renderJustifiedParagraph(doc, p, mL, y, cW, 5);
    y += 2;
  });

  y += 8;
  doc.text("Atentamente,", mL, y);

  const sigW = 36;
  const sigH = (sigW * 227) / 637;
  const signature = await getSignaturePng();
  if (signature) {
    try {
      doc.addImage(signature, "PNG", mL, y + 3, sigW, sigH);
    } catch {
      // silent fallback — continue without signature
    }
  }
  y += sigH + 8;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 85, 128);
  doc.text("QNA MEDICAL", mL, y);

  addFooter(1, 2);

  doc.addPage();
  y = 25;
  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.setFont("helvetica", "normal");
  const introSegments: Segment[] = [
    { text: "Tabla de precios de Aloinjertos para ", bold: false },
    { text: data.institution || "", bold: true },
    { text: `, por ${paymentTerms}.`, bold: false },
  ];
  y = renderJustifiedParagraph(doc, introSegments, mL, y, cW, 5);
  y += 4;

  doc.setFontSize(13);
  doc.setTextColor(0, 85, 128);
  doc.setFont("helvetica", "bold");
  doc.text("BIOLÓGICOS", pageW / 2, y, { align: "center" });
  y += 8;

  const body: string[][] = [];
  const rowCategoryIdx: number[] = [];
  products.forEach((cat, catIdx) => {
    cat.items.forEach((item) => {
      const dp = discountedPrice(item.price, data.discount);
      body.push([item.name, item.price.toLocaleString("es-CO"), dp.toLocaleString("es-CO")]);
      rowCategoryIdx.push(catIdx);
    });
  });

  const DISCOUNT_GREEN: [number, number, number] = [0, 166, 126];
  const PRICE_TEXT: [number, number, number] = [40, 40, 40];
  const ROW_LINE: [number, number, number] = [235, 238, 242];
  const CAT_LINE: [number, number, number] = [180, 200, 215];

  autoTable(doc, {
    startY: y,
    head: [["DESCRIPCIÓN", "PRECIO", `${data.discount}% DSCT`]],
    body,
    theme: "plain",
    margin: { left: mL, right: mR },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
      textColor: PRICE_TEXT,
      lineColor: ROW_LINE,
      lineWidth: { top: 0, right: 0, bottom: 0.2, left: 0 },
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [0, 113, 169],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 35 },
      2: { halign: "right", cellWidth: 35, fontStyle: "bold", textColor: DISCOUNT_GREEN },
    },
    didParseCell: (hd: CellHookData) => {
      if (hd.section !== "body") return;
      if (hd.column.index === 0) {
        hd.cell.styles.cellPadding = { top: 2, right: 3, bottom: 2, left: 0 };
      }
      const rowIdx = hd.row.index;
      const catIdx = rowCategoryIdx[rowIdx];
      const nextCatIdx =
        rowIdx < rowCategoryIdx.length - 1 ? rowCategoryIdx[rowIdx + 1] : catIdx;
      if (catIdx !== nextCatIdx) {
        hd.cell.styles.lineColor = CAT_LINE;
        hd.cell.styles.lineWidth = { top: 0, right: 0, bottom: 0.4, left: 0 };
      }
    },
    didDrawCell: (hd: CellHookData) => {
      if (hd.section !== "body") return;
      if (hd.column.index !== 1 && hd.column.index !== 2) return;
      const isDiscount = hd.column.index === 2;
      doc.setFont("helvetica", isDiscount ? "bold" : "normal");
      doc.setFontSize(8.5);
      const [r, g, b] = isDiscount ? DISCOUNT_GREEN : PRICE_TEXT;
      doc.setTextColor(r, g, b);
      const x = hd.cell.x + hd.cell.padding("left");
      const yMid = hd.cell.y + hd.cell.height / 2;
      doc.text("$", x, yMid, { baseline: "middle" });
      doc.setTextColor(40, 40, 40);
    },
  });

  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const fY = (lastTable?.finalY ?? y) + 10;
  doc.setFontSize(9);
  doc.setTextColor(50);
  doc.setFont("helvetica", "bold");
  doc.text("Vigencia de la Propuesta", mL, fY);
  doc.setFont("helvetica", "normal");
  doc.text(
    "La presente propuesta tiene vigencia de 30 días calendario a partir de su expedición.",
    mL,
    fY + 5,
  );

  addFooter(2, 2);
  return doc;
}

export function proposalFileName(data: ProposalData): string {
  return `Propuesta_QNA_${cleanFileName(data.institution)}_${cleanFileName(data.contactName)}.pdf`;
}

export async function generateSinglePDF(data: ProposalData): Promise<string> {
  const doc = await buildPDF(data);
  const fn = proposalFileName(data);
  doc.save(fn);
  return fn;
}
