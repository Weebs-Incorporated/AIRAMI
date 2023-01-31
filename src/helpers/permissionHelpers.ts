import { UserPermissions, User, ClientFacingUser } from '../types';

export const permissionsDisplayOrder: UserPermissions[] = [
    UserPermissions.Owner,
    UserPermissions.AssignPermissions,
    UserPermissions.Audit,
    UserPermissions.Upload,
];

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
    permissionSet: User | ClientFacingUser | UserPermissions,
    targetPermissions: UserPermissions,
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
    permissionSet: User | ClientFacingUser | UserPermissions,
    ...targetPermissions: UserPermissions[]
): boolean {
    for (const permission of targetPermissions) {
        if (hasPermission(permissionSet, permission)) return true;
    }
    return false;
}

export const permissionDescriptionsMap: Record<UserPermissions, string> = {
    [UserPermissions.AssignPermissions]: 'Change permissions of themselves and others.',
    [UserPermissions.Audit]: 'Modify post attributes and accept/deny/withdraw posts.',
    [UserPermissions.None]: '',
    [UserPermissions.Owner]: 'Give/remove the AssignPermissions permission to other users, and view IPs.',
    [UserPermissions.Upload]: 'Submit posts (to be audited).',
};
