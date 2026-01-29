import type { SubmitFunction } from "@sveltejs/kit";

export type ZodFlattened = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

export type ActionFailData = {
  message: string;
  issues?: ZodFlattened;
};

export type EnhanceFailState = {
  ok: false;
  message: string;
  fieldErrors: Record<string, string[] | undefined>;
  formErrors: string[];
};

export type EnhanceSuccessState = {
  ok: true;
};

export type EnhanceState = EnhanceFailState | EnhanceSuccessState;

/** Narrow unknown into ActionFailData */
export function isActionFailData(x: unknown): x is ActionFailData {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  return typeof obj.message === "string";
}

/** Ensure message is always string */
export function asMessage(x: unknown, fallback = "Revisa los datos."): string {
  return typeof x === "string" && x.trim().length ? x : fallback;
}

/**
 * Extracts a standard shape from an enhanced action result.
 * Works for fail(400/409, { message, issues }) style payloads.
 */
export function extractEnhanceState(result: unknown): EnhanceState {
  // result is expected to be ActionResult, but we keep it generic for reuse
  const r = result as any;

  if (!r || typeof r !== "object") {
    return { ok: false, message: "Respuesta inválida.", fieldErrors: {}, formErrors: [] };
  }

  if (r.type === "success") return { ok: true };

  if (r.type === "failure") {
    const data = r.data;
    if (isActionFailData(data)) {
      return {
        ok: false,
        message: asMessage(data.message, "Revisa los datos."),
        fieldErrors: data.issues?.fieldErrors ?? {},
        formErrors: data.issues?.formErrors ?? [],
      };
    }
    return { ok: false, message: "Datos inválidos.", fieldErrors: {}, formErrors: [] };
  }

  if (r.type === "error") {
    return { ok: false, message: "Error inesperado en el servidor.", fieldErrors: {}, formErrors: [] };
  }

  // redirect / unknown
  return { ok: false, message: "No se pudo procesar la solicitud.", fieldErrors: {}, formErrors: [] };
}

/**
 * Factory to build a typed enhance handler.
 * You can reuse it across pages and pass what to do on success/failure.
 */
export function buildEnhanceHandler(opts: {
  onSuccess?: () => void;
  onFailure?: (state: EnhanceFailState) => void;
  clear?: () => void; // called before submit
}): SubmitFunction {
  return () => {
    opts.clear?.();

    return async ({ result }) => {
      const state = extractEnhanceState(result);

      if (state.ok) {
        opts.onSuccess?.();
      } else {
        opts.onFailure?.(state);
      }
    };
  };
}
