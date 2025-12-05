import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schemaV1 from './v1.schema.json';
// Containment rules live in './containmentRules' and act as the single source of truth for parent->child relationships.

// PUBLIC_INTERFACE
export function getCurrentSchemaVersion() {
  /** Returns the current supported schema version number. */
  return 1;
}

// PUBLIC_INTERFACE
export function validateDesign(data) {
  /**
   * Validate the provided design object against the current schema. Throws on invalid.
   * Backward compatibility: v1 allows optional fields for grouping/collapsed metadata.
   */
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schemaV1);
  const ok = validate(data);
  if (!ok) {
    const msg = ajv.errorsText(validate.errors, { separator: '\n' });
    throw new Error(`Design validation failed:\n${msg}`);
  }
  return data;
}

// PUBLIC_INTERFACE
export function migrateToLatest(data) {
  /**
   * Placeholder migration pipeline. For v1 we simply return data.
   * Future: add migrations to populate missing group/groupCollapsed fields with defaults.
   */
  if (data?.meta?.v === 1) return data;
  // Future: add migration steps from v0 -> v1, etc.
  return data;
}
