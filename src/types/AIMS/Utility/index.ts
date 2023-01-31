export type ValuesOf<T> = T[keyof T];

/**
 * @example '2022-11-08T02:20:08.190Z'
 */
export type ISOString = string;

/**
 * ID of a user in the database.
 *
 * @example '1234567890'
 */
export type UserIdentificationString = string;
