import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ProposalData } from "./types";
import { getProducts } from "./prices";
import { cleanFileName, discountedPrice, fmt, ptLabel, todayStr } from "./format";

let cachedLogoPng: string | null = null;

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

const BODY_PARAGRAPHS = [
  "Cordial saludo,",
  "",
  "Agradecemos la oportunidad que nos brinda. Reconociendo la amplia trayectoria y experiencia de su prestigiosa institución, ponemos a su consideración nuestra propuesta técnica y económica de Aloinjertos Gold Standard, reconocidos por su alto desempeño en el mercado global.",
  "",
  "Los Aloinjertos suministrados por QNA Medical cuentan con procesos de esterilización de última generación y un contenido de hasta 100% de material biológico. Entre estas técnicas se destaca el método PASCO2, el cual utiliza dióxido de carbono supercrítico para eliminar de manera efectiva los microorganismos patógenos presentes en el material, garantizando la eliminación de cualquier tipo de contaminación microbiana. Este proceso asegura un alto potencial biológico, así como mayor seguridad para los pacientes y el personal médico.",
  "",
  "Nuestra misión es comercializar y distribuir productos de la más alta calidad, incluidos sistemas de Trauma, Fijación Externa, Reemplazos Articulares y Medicina Deportiva, orientados al tratamiento de afecciones degenerativas, traumáticas y deformidades, con aplicaciones en las áreas ortopédica, neurológica, odontológica y maxilofacial.",
  "",
  "Quedamos atentos a cualquier información adicional que requieran y a la posibilidad de establecer una relación comercial sólida y duradera.",
];

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
    if (!p) {
      y += 4;
      return;
    }
    const lines = doc.splitTextToSize(p, cW) as string[];
    lines.forEach((l) => {
      doc.text(l, mL, y);
      y += 5;
    });
    y += 2;
  });

  y += 8;
  doc.text("Atentamente,", mL, y);
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 85, 128);
  doc.text("QNA MEDICAL", mL, y);

  addFooter(1, 2);

  doc.addPage();
  y = 25;
  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.setFont("helvetica", "normal");
  const intro = `Tabla de precios de Aloinjertos para ${data.institution || ""}, por ${paymentTerms}.`;
  (doc.splitTextToSize(intro, cW) as string[]).forEach((l) => {
    doc.text(l, mL, y);
    y += 5;
  });
  y += 4;

  doc.setFontSize(13);
  doc.setTextColor(0, 85, 128);
  doc.setFont("helvetica", "bold");
  doc.text("ALOINJERTOS", pageW / 2, y, { align: "center" });
  y += 8;

  type AutoTableBody = Array<
    | Array<string | { content: string; colSpan?: number; styles?: Record<string, unknown> }>
  >;
  const body: AutoTableBody = [];
  products.forEach((cat) => {
    body.push([
      {
        content: cat.cat,
        colSpan: 3,
        styles: {
          fillColor: [232, 244, 250],
          textColor: [0, 85, 128],
          fontStyle: "bold",
          fontSize: 8,
        },
      },
    ]);
    cat.items.forEach((item) => {
      const dp = discountedPrice(item.price, data.discount);
      body.push([item.name, fmt(item.price), fmt(dp)]);
    });
  });

  autoTable(doc, {
    startY: y,
    head: [["DESCRIPCIÓN", "PRECIO", `${data.discount}% DSCT`]],
    body,
    margin: { left: mL, right: mR },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [40, 40, 40],
    },
    headStyles: {
      fillColor: [0, 113, 169],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 35 },
      2: { halign: "right", cellWidth: 35, fontStyle: "bold", textColor: [0, 166, 126] },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
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
