export const generarPdfComision = async (id: number) => {
    try {
        const response = await fetch(`/api/comisiones/${id}`);
        if (!response.ok) throw new Error('No se pudo obtener la información');
        const comision = await response.json();

        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const marginX = 25; // Margen izquierdo tipo oficio
        let currentY = 20;

        // --- ENCABEZADO ---
        // Aquí puedes añadir los logos si los tienes en Base64
        // doc.addImage(logoUjat, 'PNG', 20, 10, 40, 20); 

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`Oficio Núm. ${comision.oficioNum || '532/DACYTI-CD'}`, 190, currentY + 30, { align: 'right' });
        doc.text(`Cunduacán, Tabasco; ${new Date().toLocaleDateString()}`, 190, currentY + 35, { align: 'right' });

        // --- DESTINATARIO ---
        currentY = 70;
        const relacion = comision.docentesComision[0];
        const docente = relacion.docente;
        const nombreDocente = `${docente.nombreProf} ${docente.apePatProf} ${docente.apeMatProf || ''}`.toUpperCase();

        doc.setFontSize(11);
        doc.text(nombreDocente, marginX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text("Profesor Investigador", marginX, currentY + 5);
        doc.text("Presente", marginX, currentY + 10);

        // --- CUERPO DEL MENSAJE (Texto Justificado) ---
        currentY = 95;
        const textoCuerpo = `Comunico a usted que se le ha comisionado para colaborar en el ${comision.tipoComision.nombre}, para alumnos de nuevo ingreso al ciclo escolar (${comision.ciclo || '2025'}), en las actividades de ${comision.lugar.descripcion}, de acuerdo al siguiente calendario:`;
        
        // El método splitTextToSize ayuda a ajustar el texto al ancho del papel
        const splitText = doc.splitTextToSize(textoCuerpo, 160);
        doc.text(splitText, marginX, currentY);

        // --- TABLA DE HORARIOS ---
        // Usamos autoTable solo para la parte del calendario
        autoTable(doc, {
            startY: currentY + (splitText.length * 7),
            margin: { left: marginX, right: marginX },
            head: [['FECHA', 'HORARIO', 'AULA/SALA', 'PE']],
            body: [[
                new Date(comision.fechaInicio).toLocaleDateString(),
                `${comision.horaInicio} - ${comision.horaFin}`,
                comision.lugar.descripcion,
                comision.pe || 'ISC'
            ]],
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
            styles: { halign: 'center', fontSize: 9 }
        });

        // --- DESPEDIDA Y FIRMA ---
        currentY = (doc as any).lastAutoTable.finalY + 15;
        doc.text("Sin otro particular, reciba un cordial saludo.", marginX, currentY);

        currentY += 25;
        doc.setFont("helvetica", "bold");
        doc.text("Atentamente", marginX, currentY);
        
        // Espacio para la firma (puedes poner una imagen de firma aquí)
        currentY += 30;
        doc.text("MATI. Ericsson B. Correa Robles", marginX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text("Coordinador de Docencia", marginX, currentY + 5);

        // --- PIE DE PÁGINA (C.c.p) ---
        doc.setFontSize(8);
        doc.text(`C.c.p. ${comision.director || 'Director'}`, marginX, 260);
        doc.text("Archivo.", marginX, 265);

        const pdfUrl = doc.output('bloburl');
        window.open(pdfUrl, '_blank');

    } catch (error) {
        console.error("Error:", error);
        alert("Error al generar el PDF");
    }
};