// Canonical permission strings the template's routes / components check.
//
// Convention: `<domain>:<action>` — e.g. `items:read`, `items:write`.
// Extend as you add features. Keep this file the ONLY source of permission
// literals; components import from here so a rename shows every call site.

export const Permissions = {
  ItemsRead: 'items:read',
  ItemsWrite: 'items:write',
  ItemsDelete: 'items:delete',
  AdminAccess: 'admin:access',
} as const;

export type PermissionValue = (typeof Permissions)[keyof typeof Permissions];
