import { AIMS } from '../types';

export function splitPermissionsField(permissions: AIMS.UserPermissions): AIMS.UserPermissions[] {
    const values: AIMS.UserPermissions[] = [];
    while (permissions) {
        const bit = permissions & (~permissions + 1);
        values.push(bit);
        permissions ^= bit;
    }
    return values;
}
/**
 * Checks the provided set of permissions includes the target one(s).
 * @param {User | ClientFacingUser | UserPermissions} permissionSet Object to check permissions of.
 * @param {UserPermissions} targetPermissions Permissions that are all required.
 *
 * To check multiple permissions, simply bitwise OR them.
 *
 * @example
 * ```ts
 * const myUser = { permissions: 28 } as User;
 * hasPermission(myUser, UserPermissions.Owner | UserPermissions.Comment) // true
 * hasPermission(myUser, UserPermissions.Owner | UserPermissions.Audit) // false
 *
 * // also works with the bitfield directly
 * hasPermission(28, UserPermissions.Owner | UserPermissions.Comment) // true
 * hasPermission(28, UserPermissions.Owner | UserPermissions.Audit) // false
 * ```
 *
 * @see https://github.com/Weebs-Incorporated/AIMS/blob/main/src/helpers/userPermissionHelpers.ts
 */
export function hasPermission(
    permissionSet: AIMS.User | AIMS.ClientFacingUser | AIMS.UserPermissions,
    targetPermissions: AIMS.UserPermissions,
): boolean {
    if (typeof permissionSet === 'number') {
        return (permissionSet & targetPermissions) === targetPermissions;
    }
    return (permissionSet.permissions & targetPermissions) === targetPermissions;
}

/**
 * Checks the provided set of permissions includes any of the target ones.
 * @param {User | ClientFacingUser | UserPermissions} permissionSet Object to check permissions of.
 * @param {UserPermissions[]} targetPermissions Permissions that are required.
 *
 * To check multiple permissions, simply bitwise OR them.
 *
 * @see https://github.com/Weebs-Incorporated/AIMS/blob/main/src/helpers/userPermissionHelpers.ts
 */
export function hasOneOfPermissions(
    permissionSet: AIMS.User | AIMS.ClientFacingUser | AIMS.UserPermissions,
    ...targetPermissions: AIMS.UserPermissions[]
): boolean {
    for (const permission of targetPermissions) {
        if (hasPermission(permissionSet, permission)) return true;
    }
    return false;
}

export const permissionDescriptionsMap: Record<AIMS.UserPermissions, string> = {
    [AIMS.UserPermissions.AssignPermissions]: 'Change permissions of themselves and others.',
    [AIMS.UserPermissions.Audit]: 'Modify post attributes, delete any comments, and accept/deny/withdraw posts.',
    [AIMS.UserPermissions.Comment]: 'Comment on posts (default permission).',
    [AIMS.UserPermissions.None]: '',
    [AIMS.UserPermissions.Owner]: 'Give/remove the AssignPermissions permission to other users, and view IPs.',
    [AIMS.UserPermissions.Upload]: 'Submit posts (to be audited).',
};
