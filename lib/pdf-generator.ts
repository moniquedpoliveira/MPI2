import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Contrato, ChecklistItem } from "@prisma/client";

interface ReportData {
  contrato: Contrato;
  checklistData: ChecklistItem[];
  diaVerificacao: string;
  identificacaoFiscal?: string;
  fiscalTipo: "administrativo" | "tecnico";
}

export function generateChecklistPDF(data: ReportData): jsPDF {
  const doc = new jsPDF();

  // Configurações iniciais
  doc.setFont("helvetica");

  // Cabeçalho
  doc.setFontSize(16);
  doc.text("Planilha de Fiscalização", 105, 20, { align: "center" });
  doc.setFontSize(12);
  const title =
    data.fiscalTipo === "administrativo"
      ? "Fiscalização Administrativa: Condutas Gerais"
      : "Fiscalização Técnica: Compras";
  doc.text(title, 105, 28, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Contrato: ${data.contrato.numeroContrato}`, 105, 36, {
    align: "center",
  });

  console.log(data.checklistData);

  // Tabela do checklist
  const tableData = data.checklistData.map((item: any) => [
    item.text || "-",
    item.observationHistory && item.observationHistory.length > 0
      ? (() => {
          const lastObservation =
            item.observationHistory[item.observationHistory.length - 1];
          const date = new Date(lastObservation.createdAt);
          const formattedDate = date.toLocaleDateString("pt-BR");
          const formattedTime = date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          return `${formattedDate} ${formattedTime}`;
        })()
      : "-",
    item.currentObservation || "-",
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Item do Checklist", "Dia da Verificação", "Observações"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: "auto" },
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc;
}

export function downloadPDF(data: ReportData, filename: string) {
  const doc = generateChecklistPDF(data);
  doc.save(filename);
}

export function openPDFInNewTab(data: ReportData) {
  const doc = generateChecklistPDF(data);
  const pdfDataUri = doc.output("datauristring");
  window.open(pdfDataUri, "_blank");
}
