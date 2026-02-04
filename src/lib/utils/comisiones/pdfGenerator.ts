export const generarPdfComision = async (id: number) => {
    try {
        // 1. Obtener la información fresca desde la API
        const response = await fetch(`/api/comisiones/${id}`);
        
        if (!response.ok) {
            throw new Error('No se pudo obtener la información de la comisión');
        }

        const comision = await response.json();

        // 2. Importación dinámica de librerías
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        
        // Acceso a datos (asumiendo que viene de getById con los includes)
        const relacion = comision.docentesComision[0];
        if (!relacion || !relacion.docente) {
            throw new Error('Datos del docente no encontrados en la comisión');
        }

        const docente = relacion.docente;
        const nombreDocente = `${docente.nombreProf} ${docente.apePatProf} ${docente.apeMatProf || ''}`; 

        // --- Estilo Profesional ---
        const primaryColor = [22, 160, 133]; 
        
        doc.setFontSize(18);
        doc.text("CONSTANCIA DE COMISIÓN ACADÉMICA", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Clave: ${comision.claveComision}`, 105, 27, { align: 'center' }); 

        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.line(20, 35, 190, 35);

        // Tabla de datos
        autoTable(doc, {
            startY: 45,
            head: [['Concepto', 'Información']],
            body: [
                ['Docente', nombreDocente],
                ['Tipo de Comisión', comision.tipoComision.nombre], 
                ['Lugar', comision.lugar.descripcion], 
                ['Fecha Inicio', new Date(comision.fechaInicio).toLocaleDateString()], 
                ['Fecha Fin', comision.fechaFin ? new Date(comision.fechaFin).toLocaleDateString() : 'N/A'], 
                ['Horario', `${comision.horaInicio} - ${comision.horaFin}`],
                ['Observaciones', comision.observaciones || 'Sin observaciones']
            ],
            headStyles: { fillColor: primaryColor }
        });

        const pdfUrl = doc.output('bloburl');
        window.open(pdfUrl, '_blank');

    } catch (error) {
        console.error("Error al generar PDF:", error);
        // Aquí podrías usar un toast.error si tienes acceso a la librería en este archivo
        alert("Error al generar el PDF: " + error.message);
    }
};