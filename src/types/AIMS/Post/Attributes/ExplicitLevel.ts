import { ValuesOf } from '../../Utility';

export const ExplicitLevel = {
    /** Nothing even slightly sexualised. */
    Safe: 0,

    /** Some aspects of the image may be slightly sexualised. */
    Low: 1,

    /**
     * Some aspects of the image are sexualized, but not overwhelmingly, e.g.
     *
     * - Somewhat revealing clothing.
     * - Sussy camera angle.
     * - Slightly pronounced features.
     */
    Medium: 2,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ExplicitLevel = ValuesOf<typeof ExplicitLevel>;
