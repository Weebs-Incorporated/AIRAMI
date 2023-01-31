export enum UserPermissions {
    None = 0,

    /**
     * Change permissions of themselves and others.
     *
     * - Cannot remove this permission from themselves.
     * - Cannot modify permissions of other users who have this permission.
     */
    AssignPermissions = 1 << 0,

    /** Modify post attributes and accept/deny/withdraw posts. */
    Audit = 1 << 1,

    /** Submit posts (to be audited). */
    Upload = 1 << 2,

    /** Give/remove the `AssignPermissions` permission to other users, and view IPs. */
    Owner = 1 << 3,
}
