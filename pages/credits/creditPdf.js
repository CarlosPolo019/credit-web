import { jsPDF } from "jspdf";
import { estimateCreditPayment } from "../../lib/creditPayment.js";
import { formatCurrency, formatDate } from "../../lib/format.js";

const INK = "#052224";
const MUTED = "#6b7280";
const PANEL = "#f5faf8";
const BORDER = "#e3efeb";

function loadLogoDataUrl() {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = "/fya-mark.png";
  });
}

function clientFullName(credit) {
  return credit.clientName || [
    credit.clientFirstName,
    credit.clientSecondName,
    credit.clientFirstSurname,
    credit.clientSecondSurname,
  ].filter(Boolean).join(" ");
}

function row(doc, x, y, width, label, value, { emphasis = false } = {}) {
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(label.toUpperCase(), x, y);
  doc.setTextColor(INK);
  doc.setFont("helvetica", emphasis ? "bold" : "normal");
  doc.setFontSize(emphasis ? 13 : 11);
  doc.text(String(value ?? "-"), x, y + 6);
  return y + (emphasis ? 15 : 13);
}

/**
 * Builds and downloads a one-page "credit certificate" PDF for a single
 * credit — the same brand palette as the web app and the notification
 * email, so the document reads as one consistent product experience.
 */
export async function exportCreditPdf(credit) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;

  // Header band
  doc.setFillColor(INK);
  doc.rect(0, 0, pageWidth, 32, "F");
  const logo = await loadLogoDataUrl();
  if (logo) {
    doc.addImage(logo, "PNG", marginX, 8, 16, 16);
  }
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Fya Social Capital", marginX + (logo ? 20 : 0), 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor("#b7ece0");
  doc.text("Certificado de crédito", marginX + (logo ? 20 : 0), 23);

  doc.setTextColor("#b7ece0");
  doc.setFontSize(8);
  doc.text(`Emitido ${formatDate(new Date().toISOString())}`, pageWidth - marginX, 23, { align: "right" });

  let y = 46;
  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(clientFullName(credit), marginX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text(`Cédula o ID: ${credit.clientDocument ?? "-"}`, marginX, y);
  y += 12;

  // Highlighted amount panel
  doc.setFillColor(PANEL);
  doc.setDrawColor(BORDER);
  doc.roundedRect(marginX, y, contentWidth, 24, 3, 3, "FD");
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("VALOR DEL CRÉDITO", marginX + 8, y + 9);
  doc.setTextColor("#03a565");
  doc.setFontSize(18);
  doc.text(formatCurrency(credit.amount), marginX + 8, y + 18);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("ESTADO", pageWidth - marginX - 8, y + 9, { align: "right" });
  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(credit.isActive === false ? "Inactivo" : "Activo", pageWidth - marginX - 8, y + 18, { align: "right" });
  y += 36;

  // Two-column detail grid
  const colWidth = contentWidth / 2;
  const leftX = marginX;
  const rightX = marginX + colWidth;
  let leftY = y;
  let rightY = y;
  leftY = row(doc, leftX, leftY, colWidth, "Comercial", credit.salespersonName);
  leftY = row(doc, leftX, leftY, colWidth, "Tasa de interés mensual", `${credit.interestRate}%`);
  leftY = row(doc, leftX, leftY, colWidth, "Plazo", `${credit.termMonths} meses`);

  const { monthlyPayment, totalToPay } = estimateCreditPayment(credit);
  rightY = row(doc, rightX, rightY, colWidth, "Fecha de registro", formatDate(credit.createdAt));
  rightY = row(doc, rightX, rightY, colWidth, "Cuota mensual estimada", formatCurrency(monthlyPayment));
  rightY = row(doc, rightX, rightY, colWidth, "Total estimado a pagar", formatCurrency(totalToPay), { emphasis: true });

  y = Math.max(leftY, rightY) + 4;
  doc.setDrawColor(BORDER);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text(
    "Cálculo estimado (amortización francesa, tasa mensual fija). Documento informativo, no constituye un pagaré.",
    marginX,
    y,
    { maxWidth: contentWidth },
  );

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text(`ID del crédito: ${credit.id}`, marginX, pageHeight - 14);
  doc.text("Fya Social Capital · Prueba técnica de créditos", pageWidth - marginX, pageHeight - 14, { align: "right" });

  const fileSafeName = clientFullName(credit).trim().replace(/\s+/g, "-").toLowerCase() || "cliente";
  doc.save(`credito-${fileSafeName}-${credit.id}.pdf`);
}
