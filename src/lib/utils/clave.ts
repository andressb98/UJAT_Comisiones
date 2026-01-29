import { prisma } from "$lib/server/prisma";


export function slugLetters(input: string, maxLetters = 3) {
  const clean = (input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();

  const letters = clean
    .split(/\s+/)
    .filter(Boolean)
    .join("")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

  return (letters.slice(0, maxLetters) || "LUG").padEnd(maxLetters, "X");
}

export function random4Digits() {
  // 0000 a 9999 (con padding)
  const n = Math.floor(Math.random() * 10000);
  return String(n).padStart(4, "0");
}

export function buildClaveFromDescripcion(descripcion: string) {
  const digits = random4Digits();
  const letters = slugLetters(descripcion, 3);
  return `${digits}${letters}`; // ej: 0421AUD
}


export function generateUniqueClaveComision(descripcion: string) {
  const digits = random4Digits(); // Genera 4 dígitos aleatorios
  const letters = slugLetters(descripcion, 3); // Extrae las primeras 3 letras de la descripción
  const timestampSuffix = String(Date.now()).slice(-6); // Últimos 6 dígitos del timestamp
  return `COM-${digits}${letters}${timestampSuffix}`; // Formato: COM-0421AUD123456
}

export async function generateUniqueClave() {
  const prefix = "COM";  // Prefijo fijo para la comisión

  // Obtener la última comisión registrada
  const lastComision = await prisma.comision.findFirst({
    orderBy: { claveComision: "desc" },  // Ordenamos por la clave de la comisión de forma descendente
    select: { claveComision: true },
  });

  // Extraer el número de la última comisión
  let lastNumber = 0;
  if (lastComision) {
    const lastClave = lastComision.claveComision;
    // Tomamos los últimos 5 caracteres de la clave (el número secuencial)
    const lastNumStr = lastClave.slice(4);
    lastNumber = parseInt(lastNumStr, 10);
  }

  // Generar la siguiente clave
  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(5, "0");  // Aseguramos que tenga 5 dígitos
  const clave = `${prefix}-${paddedNumber}`;  // Construimos la clave con el prefijo y el número secuencial

  return clave;
}