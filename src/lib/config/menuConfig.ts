export type MenuItem = {
  label: string;
  route: string;
  permiso?: string;
};


export const MENU_CATALOGO: MenuItem[] = [
  { label: "Dashboard", route: "/dashboard" },

  { label: "Docentes", route: "/docentes", permiso: "DOCENTES_VER" },
  { label: "Tipos de comisión", route: "/tipos-comisiones", permiso: "TIPOS_COMISION_VER" },
  { label: "Lugares", route: "/lugares", permiso: "LUGARES_VER" },
  { label: "U. administrativas", route: "/unidadesAdministrativas", permiso: "UNIDADES_VER" },
  { label: "Divisiones", route: "/divisiones", permiso: "DIVISION_VER" }
];

export const MENU_REGISTRO: MenuItem[] = [
  { label: "Captura", route: "/captura", permiso: "COMISIONES_CREAR" },
  { label: "Reportes", route: "/reportes", permiso: "COMISIONES_VER" }
];

export const MENU_CONFIGURACION: MenuItem[] = [
  { label: "Usuarios", route: "/usuarios", permiso : "USUARIOS_VER" }
];
