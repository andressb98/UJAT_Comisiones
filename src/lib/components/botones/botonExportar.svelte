<script lang="ts">
	import * as XLSX from 'xlsx';
	import jsPDF from 'jspdf';
	import autoTable from 'jspdf-autotable';

	// Props genéricas
	export let dataToExport: any[] = [];
	export let filename: string = 'reporte';
	export let title: string = 'Reporte de Sistema';

	function exportExcel() {
		if (dataToExport.length === 0) return;
		const worksheet = XLSX.utils.json_to_sheet(dataToExport);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
		XLSX.writeFile(workbook, `${filename}.xlsx`);
	}

	function exportPdf() {
		if (dataToExport.length === 0) return;

		// 1. Detectar cantidad de columnas
		const columnKeys = Object.keys(dataToExport[0]);
		const numColumns = columnKeys.length;

		// 2. Configurar orientación: Si hay más de 6 columnas, usar horizontal (landscape)
		const orientation = numColumns > 6 ? 'landscape' : 'portrait';
		const doc = new jsPDF({ orientation });

		// 3. Ajustar tamaño de fuente dinámicamente
		// Si hay muchas columnas (ej. 12+), bajamos la fuente a 6 o 7 para que quepan
		let dynamicFontSize = 8;
		if (numColumns > 10) dynamicFontSize = 6;
		else if (numColumns > 7) dynamicFontSize = 7;

		const headers = [columnKeys];
		const rows = dataToExport.map((obj) => Object.values(obj));

		doc.setFontSize(14);
		doc.text(title, 14, 15);

		autoTable(doc, {
			head: headers,
			body: rows,
			startY: 25,
			theme: 'grid',
			styles: {
				fontSize: dynamicFontSize,
				cellPadding: 2,
				overflow: 'linebreak' 
			},
			headStyles: {
				fillColor: [0, 150, 136], 
				textColor: 255
			},
			columnStyles: {
				
			},
			margin: { horizontal: 7 } 
		});

		doc.save(`${filename}.pdf`);
	}
</script>

<div class="dropdown is-right is-hoverable">
	<div class="dropdown-trigger">
		<button class="button is-link is-light" aria-haspopup="true" aria-controls="dropdown-menu">
			<span>Exportar</span>
			<span class="icon is-small">
				<i class="fas fa-angle-down"></i>
			</span>
		</button>
	</div>
	<div class="dropdown-menu" id="dropdown-menu" role="menu">
		<div class="dropdown-content">
			<a class="dropdown-item" on:click={exportExcel}>
				<span class="icon has-text-success"><i class="fas fa-file-excel"></i></span>
				<span>Excel (.xlsx)</span>
			</a>
			<a class="dropdown-item" on:click={exportPdf}>
				<span class="icon has-text-danger"><i class="fas fa-file-pdf"></i></span>
				<span>PDF (.pdf)</span>
			</a>
		</div>
	</div>
</div>

<style>
	/* Ajuste para que el cursor cambie a puntero en los items del dropdown */
	.dropdown-item {
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
