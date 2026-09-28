import type { ValidationIssue } from "./types.ts";

/**
 * Minimal structural schema validation (no dependencies). Produces readable
 * Spanish messages; the dotted `field` path is kept for the UI, never shown raw.
 */

interface Base {
  /** Spanish noun used in messages: "objetivo", "máximo de iteraciones"… */
  label: string;
  optional?: boolean;
}

export type Schema =
  | (Base & { type: "string"; oneOf?: readonly string[] })
  | (Base & { type: "number" })
  | (Base & { type: "boolean" })
  | (Base & { type: "array"; items: Schema })
  | (Base & { type: "object"; props: Record<string, Schema> });

interface Where {
  /** Human location prefix, e.g. "En el elemento 2 de «ejemplos», ". */
  prefix: string;
}

const typeNames: Record<"string" | "number" | "boolean", string> = {
  string: "texto",
  number: "un número",
  boolean: "verdadero o falso",
};

function issue(code: string, path: string[], message: string): ValidationIssue {
  return { code, severity: "error", field: path.join(".") || undefined, message };
}

function sentence(where: Where, body: string): string {
  const text = `${where.prefix}${body}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function check(value: unknown, schema: Schema, path: string[], where: Where, out: ValidationIssue[]): void {
  if (value === undefined || value === null) {
    if (!schema.optional) out.push(issue("schema.required", path, sentence(where, `falta el campo «${schema.label}».`)));
    return;
  }
  switch (schema.type) {
    case "string":
    case "number":
    case "boolean": {
      const ok = schema.type === "number" ? typeof value === "number" && !Number.isNaN(value) : typeof value === schema.type;
      if (!ok) {
        out.push(issue("schema.type", path, sentence(where, `el campo «${schema.label}» debe ser ${typeNames[schema.type]}.`)));
        return;
      }
      if (schema.type === "string" && schema.oneOf && !schema.oneOf.includes(value as string)) {
        out.push(
          issue(
            "schema.enum",
            path,
            sentence(where, `«${String(value)}» no es un valor válido para «${schema.label}» (valores permitidos: ${schema.oneOf.join(", ")}).`),
          ),
        );
      }
      return;
    }
    case "array": {
      if (!Array.isArray(value)) {
        out.push(issue("schema.type", path, sentence(where, `el campo «${schema.label}» debe ser una lista.`)));
        return;
      }
      value.forEach((item, index) => {
        const itemWhere: Where = { prefix: `en el elemento ${index + 1} de «${schema.label}», ` };
        if (schema.items.type === "object") {
          check(item, schema.items, [...path, String(index)], itemWhere, out);
        } else if (item === undefined || item === null || !matchesPrimitive(item, schema.items)) {
          out.push(
            issue(
              "schema.type",
              [...path, String(index)],
              sentence(where, `el elemento ${index + 1} de «${schema.label}» debe ser ${describe(schema.items)}.`),
            ),
          );
        }
      });
      return;
    }
    case "object": {
      if (typeof value !== "object" || Array.isArray(value)) {
        out.push(issue("schema.type", path, sentence(where, `el campo «${schema.label}» tiene un formato inválido.`)));
        return;
      }
      const record = value as Record<string, unknown>;
      for (const [key, child] of Object.entries(schema.props)) {
        check(record[key], child, [...path, key], where, out);
      }
      return;
    }
  }
}

function matchesPrimitive(value: unknown, schema: Schema): boolean {
  if (schema.type === "string") return typeof value === "string" && (!schema.oneOf || schema.oneOf.includes(value));
  if (schema.type === "number") return typeof value === "number" && !Number.isNaN(value);
  if (schema.type === "boolean") return typeof value === "boolean";
  return true;
}

function describe(schema: Schema): string {
  if (schema.type === "string" && schema.oneOf) return `uno de: ${schema.oneOf.join(", ")}`;
  if (schema.type === "string" || schema.type === "number" || schema.type === "boolean") return typeNames[schema.type];
  return schema.type === "array" ? "una lista" : "un objeto";
}

export function validateAgainstSchema(value: unknown, schema: Schema): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  check(value, schema, [], { prefix: "" }, out);
  return out;
}

// ───────────────────────── Builders ─────────────────────────

export const s = {
  string: (label: string, optional = true, oneOf?: readonly string[]): Schema => ({ type: "string", label, optional, oneOf }),
  number: (label: string, optional = true): Schema => ({ type: "number", label, optional }),
  boolean: (label: string, optional = true): Schema => ({ type: "boolean", label, optional }),
  array: (label: string, items: Schema, optional = true): Schema => ({ type: "array", label, items, optional }),
  object: (label: string, props: Record<string, Schema>, optional = true): Schema => ({ type: "object", label, props, optional }),
};
