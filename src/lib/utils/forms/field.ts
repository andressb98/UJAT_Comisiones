export function hasFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  name: string
) {
  return Boolean(fieldErrors?.[name]?.length);
}

export function firstFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  name: string
) {
  return fieldErrors?.[name]?.[0] ?? null;
}
