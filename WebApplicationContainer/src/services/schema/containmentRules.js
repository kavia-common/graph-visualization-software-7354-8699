//
// Containment Rules - Single Source of Truth
//
// This module defines which node types can contain which other types,
// provides helper utilities to validate containment, and exposes clear
// defaults/overrides for easy future adjustments.
//
// How to modify rules:
// - Add or change entries in ALLOWED_CHILDREN to map parentType -> allowed child types.
// - Update DEVICE_TYPES list if new device types are added that can contain interface/port.
// - Adjust TOP_LEVEL_TYPES to control which types can be created at the canvas root (parentId = null).
// - Use TOP_LEVEL_OVERRIDES to allow additional direct placement under the top-level parent (e.g., site can contain room).
//
// Backward compatibility:
// - Only types in TOP_LEVEL_TYPES can be created at top-level (parentId = null).
// - If a parentId is provided, canContain(parentType, childType) must return true.
//
// PUBLIC INTERFACES are marked with the PUBLIC_INTERFACE comment.
//

// Device types that are considered "device" for containment purposes.
export const DEVICE_TYPES = ['router', 'switch', 'generic-device'];

// The canonical allowed children mapping: parentType -> array of allowed child types
// Note: 'rack' can contain either positions (grid cells) or slots (vertical slots).
export const ALLOWED_CHILDREN = {
  site: ['building'], // top-most hierarchy
  building: ['room'],
  room: ['rack'],
  rack: ['position', 'slot'],
  position: ['device'],
  slot: ['device'],
  device: ['interface', 'port'], // applies to router/switch/generic-device
  interface: [], // no children
  port: [], // no children
};

// Types allowed to be created at top-level (no parentId provided).
export const TOP_LEVEL_TYPES = ['site'];

// Optional overrides for allowing a type directly under the implicit top-level canvas/root.
// For example, allow 'room' to be created directly under the overall design (without a site).
export const TOP_LEVEL_OVERRIDES = ['room'];

// Normalization: map specific device types to 'device' for rules lookup.
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
  if (TOP_LEVEL_TYPES.includes(type)) return true;
  // Overrides allow directly at top-level as well
  if (TOP_LEVEL_OVERRIDES.includes(type)) return true;
  return false;
}

// PUBLIC_INTERFACE
export function isDeviceType(type) {
  /** Returns true if the given type is considered a device. */
  return DEVICE_TYPES.includes(type) || type === 'device';
}

// PUBLIC_INTERFACE
export function canContain(parentType, childType) {
  /**
   * Determine if a parent of parentType can contain a child of childType.
   * - Applies device normalization so that 'router'/'switch'/'generic-device' behave as 'device'.
   * - Returns false if either type is missing or unknown to rules.
   */
  if (!parentType || !childType) return false;
  const normalizedParent = normalizeParentType(parentType);
  // If the parent is unknown, reject by default
  if (!normalizedParent) return false;

  const allowed = ALLOWED_CHILDREN[normalizedParent];
  if (!Array.isArray(allowed)) return false;

  // Child can be a specific device variant; parent 'position'/'slot' permits 'device' in rules
  if (childType === 'device' || isDeviceType(childType)) {
    // If parent allows 'device' and child is one of the device variants, accept
    if (allowed.includes('device')) return true;
  }

  // Else direct membership check
  return allowed.includes(childType);
}

// PUBLIC_INTERFACE
export function describeContainmentRule(parentType) {
  /** Return a human-readable string describing allowed children for a parentType. */
  const children = getAllowedChildren(parentType);
  if (!children.length) return `${parentType} cannot contain any children`;
  return `${parentType} may contain: ${children.join(', ')}`;
}
