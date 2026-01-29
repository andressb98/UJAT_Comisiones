// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: { id: number; nombre: string; correo: string } | null;

			roles: { id: number; codigo: RolCodigo; nombre: string }[];
			permisos: PermisoCodigo[];

			division: DivisionLite | null;
			unidad: UnidadLite | null;

			hasPermiso: (p: PermisoCodigo) => boolean;
			hasRol: (r: RolCodigo) => boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
