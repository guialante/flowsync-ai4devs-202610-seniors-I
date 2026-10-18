import { ApiError } from "@/lib/api";

export type FormErrors = {
  form?: string;
  fields: Record<string, string>;
};

const FIELD_MESSAGES: Record<string, string> = {
  "email.database.unique": "Ya existe una cuenta con este email.",
  "email.email": "Introduce un email válido.",
  "email.required": "El email es obligatorio.",
  "email.maxLength": "El email es demasiado largo.",
  "password.required": "La contraseña es obligatoria.",
  "password.minLength": "La contraseña debe tener al menos 8 caracteres.",
  "password.maxLength": "La contraseña no puede superar los 32 caracteres.",
  "passwordConfirmation.required": "Confirma tu contraseña.",
  "passwordConfirmation.sameAs": "Las contraseñas no coinciden.",
  "passwordConfirmation.minLength":
    "La contraseña debe tener al menos 8 caracteres.",
  "passwordConfirmation.maxLength":
    "La contraseña no puede superar los 32 caracteres.",
};

/**
 * Turns an API failure into messages the forms can show next to each field
 * or as a banner, instead of leaking raw backend or network errors.
 */
export function toFormErrors(
  error: unknown,
  context: "login" | "signup",
): FormErrors {
  if (!(error instanceof ApiError)) {
    return {
      form: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      fields: {},
    };
  }

  if (context === "login" && error.status === 400) {
    return { form: "Email o contraseña incorrectos.", fields: {} };
  }

  if (error.status === 422) {
    const fields: Record<string, string> = {};
    for (const { field, rule, message } of error.errors) {
      if (!field || fields[field]) continue;
      fields[field] = FIELD_MESSAGES[`${field}.${rule}`] ?? message;
    }
    return { fields };
  }

  return {
    form: "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
    fields: {},
  };
}
