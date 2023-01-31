import { ValuesOf } from '../../Utility';

/** Colours for eyes, hair, etc... */
export const Colours = {
    Black: 1 << 0,

    White: 1 << 1,

    Red: 1 << 2,

    Green: 1 << 3,

    Blue: 1 << 4,

    Pink: 1 << 5,

    Purple: 1 << 6,

    Blonde: 1 << 7,

    /** For hair, brunette goes here too because IDK my colours. */
    Brown: 1 << 8,

    Grey: 1 << 9,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Colours = ValuesOf<typeof Colours>;
