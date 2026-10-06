// shared/permissions.ts
export const ALL_PERMISSIONS = [
    'customers:view',
    'customers:edit',
    'customers:delete',
    'customers:add',
    'documents:view',
    'documents:edit',
    'documents:delete',
    'documents:add',
    'documents:accept',
    'users:view',
    'users:edit',
    'users:delete',
    'users:add',
    'role:view',
    'role:edit',
    'role:delete',
    'role:add',
    'template:view',
    'template:add',
    'template:edit',
    'template:delete',
    'system:all'
] as const;

export type PermissionAction = (typeof ALL_PERMISSIONS)[number];

