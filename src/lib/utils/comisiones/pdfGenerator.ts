export const generarPdfComision = async (comision: any) => {
    // Importación dinámica para evitar errores de SSR/Vite
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const docente = comision.docentesComision[0].docente; [cite: 16, 62]
    const nombreDocente = `${docente.nombreProf} ${docente.apePatProf}`; [cite: 16, 62]

    // --- Estilo Profesional ---
    const primaryColor = [22, 160, 133]; 
    
    doc.setFontSize(18);
    doc.text("CONSTANCIA DE COMISIÓN ACADÉMICA", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Clave: ${comision.claveComision}`, 105, 27, { align: 'center' }); [cite: 61]

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, 35, 190, 35);

    // Tabla de datos
    autoTable(doc, {
        startY: 45,
        head: [['Concepto', 'Información']],
        body: [
            ['Docente', nombreDocente],
            ['Tipo de Comisión', comision.tipoComision.nombre], [cite: 17],
            ['Lugar', comision.lugar.descripcion], [cite: 17],
            ['Fecha Inicio', new Date(comision.fechaInicio).toLocaleDateString()], [cite: 26],
            ['Fecha Fin', comision.fechaFin ? new Date(comision.fechaFin).toLocaleDateString() : 'N/A'], [cite: 17, 26],
            ['Horario', `${comision.horaInicio} - ${comision.horaFin}`], [cite: 18]
        ],
        headStyles: { fillColor: primaryColor }
    });

    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
};