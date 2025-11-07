document.addEventListener("DOMContentLoaded", () => {

  const exportLinks = document.querySelectorAll("#exportOptions a");

  exportLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const format = link.dataset.format;
      const table = document.querySelector("table"); // se puede mejorar si se pasan id por parámetro
      if (!table) return alert("No se encontró la tabla para exportar");

      switch(format) {
        case "csv":
          exportToCSV(table);
          break;
        case "excel":
          exportToExcel(table);
          break;
        case "pdf":
          exportToPDF(table);
          break;
      }
    });
  });

  // ===== CSV =====
  function exportToCSV(table, filename = 'datos.csv') {
    let csv = [];
    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
      const cols = row.querySelectorAll("td, th");
      const rowData = [];
      cols.forEach(col => rowData.push(col.textContent.replace(/,/g, "")));
      csv.push(rowData.join(","));
    });

    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(csvFile);
    a.download = filename;
    a.click();
  }

  // ===== Excel =====
  function exportToExcel(table, filename = 'datos.xlsx') {
    const wb = XLSX.utils.table_to_book(table, { sheet: "Datos" });
    XLSX.writeFile(wb, filename);
  }

  // ===== PDF =====
  function exportToPDF(table, filename = 'datos.pdf') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Opcional: agregar logo en el encabezado
    const img = new Image();
    img.src = "img/logo.png"; // ruta a tu logo
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 5, 30, 15);
      doc.text("Listado de Datos", 50, 15);

      doc.autoTable({ html: table, startY: 25 });
      doc.save(filename);
    };

    img.onerror = () => {
      doc.text("Listado de Datos", 10, 10);
      doc.autoTable({ html: table, startY: 15 });
      doc.save(filename);
    };
  }

});
