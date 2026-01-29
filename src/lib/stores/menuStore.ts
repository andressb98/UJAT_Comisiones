import { writable, get } from "svelte/store";
import { MENU_CATALOGO, MENU_CONFIGURACION, MENU_REGISTRO, type MenuItem } from "$lib/config/menuConfig";

export const selectedCategory = writable<"catalogo" | "registro" | "configuracion">("catalogo");
export const activeMenuItems = writable<MenuItem[]>([]);

/**
 * Recalcula el menú visible en base a la categoría y permisos del usuario.
 * - Si el item no tiene `permiso`, se muestra.
 * - Si tiene `permiso`, debe existir en `permisos`.
 */
export function recomputeMenu(permisos: string[] = []) {
  const cat = get(selectedCategory);

  const base =
    cat === "catalogo"
      ? MENU_CATALOGO
      : cat === "registro"
        ? MENU_REGISTRO
        : MENU_CONFIGURACION;

  // Filtra solo los elementos que tienen permiso o no tienen permiso asignado
  const filtered = base.filter((it) => !it.permiso || permisos.includes(it.permiso));
  activeMenuItems.set(filtered); // Actualiza los elementos del menú
}

