import { useState } from "react";
import type { RefObject } from "react";

type ExportPdfButtonProps = {
  targetRef: RefObject<HTMLElement | null>;
  filename: string;
};

export function ExportPdfButton({ targetRef, filename }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!targetRef.current) {
      return;
    }

    try {
      setIsExporting(true);
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        backgroundColor: "#fffdf8",
      });

      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth() - 40;
      const pageHeight = pdf.internal.pageSize.getHeight() - 40;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let heightLeft = imageHeight;
      let position = 20;

      pdf.addImage(image, "PNG", 20, position, pageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight + 20;
        pdf.addPage();
        pdf.addImage(image, "PNG", 20, position, pageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button className="ghost-button" onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Generating PDF..." : "Export PDF"}
    </button>
  );
}
