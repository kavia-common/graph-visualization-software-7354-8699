# Graph Design Schema

- Current version: v1 (`meta.v = 1`)
- Validated with AJV (see `src/services/schema/index.js`)
- Deterministic export sorts nodes/edges by id

Migration guide:
- For future versions, add migration functions to `migrateToLatest`.
- Keep previous JSON schemas alongside (v1.schema.json, v2.schema.json, ...).
