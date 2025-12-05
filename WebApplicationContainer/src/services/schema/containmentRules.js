//
// Containment Rules - Single Source of Truth
//
// This module defines which node types can contain which other types,
// provides helper utilities to validate containment, and exposes clear
// helpers to enforce quantity caps for certain children.
//
// Exact Matrix and Constraints (per requirements):
// - Top-level allowed types: ["site"].
// - Parent → allowed children:
//   site: [building]
//   building: [room]
//   room: [rack]
//   rack: [rackPosition, slot]
//   rackPosition: [device]
//   slot: [device]
//   device (router, switch): [interface, port]
//   interface: []
//   port: []
//
// Quantity caps:
// - rackPosition indices 1..42 within a rack
// - slot positions 1..16 within a rack
//
// PUBLIC INTERFACES are marked with the PUBLIC_INTERFACE comment.
//

// Device variants that are considered "device" for containment purposes.
// PUBLIC_INTERFACE
export const DEVICE_TYPES = ['router', 'switch'];

// The canonical allowed children mapping: parentType -> array of allowed child types
/**
 * Mapping of allowed children for each parent type.
 */
export const ALLOWED_CHILDREN = {
  site: ['building'],
  building: ['room'],
  room: ['rack'],
  rack: ['rackPosition', 'slot'],
  rackPosition: ['device'],
  slot: ['device'],
  device: ['interface', 'port'], // applies to router/switch via normalization
  interface: [],
  port: [],
};

/**
 * Layout config per container type to support autoresize behavior
 * minWidth/minHeight are inner-content minimums; padding expands outer bounds.
 */
export const LAYOUT_CONFIG = {
  site: { minWidth: 300, minHeight: 220, padding: 16, autoresize: true },
  building: { minWidth: 260, minHeight: 200, padding: 16, autoresize: true },
  room: { minWidth: 220, minHeight: 180, padding: 16, autoresize: true },
  rack: { minWidth: 160, minHeight: 160, padding: 12, autoresize: true },
  // Non-container or leaf types default
  default: { minWidth: 140, minHeight: 120, padding: 8, autoresize: false },
};

// PUBLIC_INTERFACE
export function getLayoutConfigFor(type) {
  /** Returns layout config for the given domain type. */
  const t = type || 'default';
  return LAYOUT_CONFIG[t] || LAYOUT_CONFIG.default;
}

// Types allowed to be created at top-level (no parentId provided).
// PUBLIC_INTERFACE
export const TOP_LEVEL_TYPES = ['site'];

// Normalize specific device types to 'device' for rules lookup
function normalizeParentType(parentType) {
  if (!parentType) return null;
  if (DEVICE_TYPES.includes(parentType)) return 'device';
  return parentType;
}

// PUBLIC_INTERFACE
export function getAllowedChildren(parentType) {
  /** Return array of allowed child types for a given parentType (normalized). */
  const p = normalizeParentType(parentType);
  if (!p) return [];
  return ALLOWED_CHILDREN[p] || [];
}

// PUBLIC_INTERFACE
export function isAllowedAtTopLevel(type) {
  /** Check if a type can be created at top-level (no parentId). */
  if (!type) return false;
  return TOP_LEVEL_TYPES.includes(type);
}

// PUBLIC_INTERFACE
export function isDeviceType(type) {
  /** Returns true if the given type is considered a device variant. */
  return DEVICE_TYPES.includes(type) || type === 'device';
}

// PUBLIC_INTERFACE
export function canContain(parentType, childType) {
  /**
   * Determine if a parent of parentType can contain a child of childType.
   * - Applies device normalization so that 'router'/'switch' behave as 'device'.
   * - Returns false if either type is missing or unknown to rules.
   */
  if (!parentType || !childType) return false;
  const normalizedParent = normalizeParentType(parentType);
  if (!normalizedParent) return false;

  const allowed = ALLOWED_CHILDREN[normalizedParent];
  if (!Array.isArray(allowed)) return false;

  if (childType === 'device' || isDeviceType(childType)) {
    return allowed.includes('device');
  }
  return allowed.includes(childType);
}

// PUBLIC_INTERFACE
export function describeContainmentRule(parentType) {
  /** Return a human-readable string describing allowed children for a parentType. */
  const children = getAllowedChildren(parentType);
  if (!children.length) return `${parentType} cannot contain any children`;
  return `${parentType} may contain: ${children.join(', ')}`;
}

// Caps for rack children
const RACK_POSITION_MIN = 1;
const RACK_POSITION_MAX = 42;
const RACK_SLOT_MIN = 1;
const RACK_SLOT_MAX = 16;

// PUBLIC_INTERFACE
export function validateRackPositionIndex(index) {
  /** Validate that rackPosition index is within [1..42]. */
  const n = Number(index);
  return Number.isInteger(n) && n >= RACK_POSITION_MIN && n <= RACK_POSITION_MAX;
}

// PUBLIC_INTERFACE
export function validateRackSlotIndex(index) {
  /** Validate that slot index is within [1..16]. */
  const n = Number(index);
  return Number.isInteger(n) && n >= RACK_SLOT_MIN && n <= RACK_SLOT_MAX;
}

// PUBLIC_INTERFACE
export function canAddChildWithCaps(parentNode, childType, siblings = []) {
  /**
   * Enforce caps for rack children:
   * - parent type 'rack':
   *   * 'rackPosition' children: max 42, indices must be 1..42, unique
   *   * 'slot' children: max 16, indices must be 1..16, unique
   * For other parents, no caps (besides matrix) are enforced here.
   *
   * parentNode: a node object that includes .type (domain type).
   * childType: type being added.
   * siblings: array of existing child nodes under this parent (domain nodes).
   *
   * Returns: { ok: boolean, message?: string }
   */
  const pType = parentNode?.type || parentNode?.data?.domainType || parentNode?.data?.type || null;
  const normalizedParent = normalizeParentType(pType);
  if (normalizedParent !== 'rack') {
    return { ok: true };
  }

  if (childType === 'rackPosition') {
    const existing = siblings.filter((c) => (c.type || c?.data?.domainType || c?.data?.type) === 'rackPosition');
    if (existing.length >= RACK_POSITION_MAX) {
      return { ok: false, message: `A rack can have at most ${RACK_POSITION_MAX} rackPosition children.` };
    }
    return { ok: true };
  }

  if (childType === 'slot') {
    const existing = siblings.filter((c) => (c.type || c?.data?.domainType || c?.data?.type) === 'slot');
    if (existing.length >= RACK_SLOT_MAX) {
      return { ok: false, message: `A rack can have at most ${RACK_SLOT_MAX} slot children.` };
    }
    return { ok: true };
  }

  return { ok: true };
}

// PUBLIC_INTERFACE
export function isAutoResizingContainer(type) {
  /** True if this type has autoresize behavior enabled in layout config. */
  const cfg = getLayoutConfigFor(type);
  return !!cfg?.autoresize;
}
