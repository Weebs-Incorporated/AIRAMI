import { ValuesOf } from '../../Utility';

export const LightLevel = {
    /** Black/very dark background. */
    Low: 0,

    Medium: 1,

    /** Pure white background, and/or very bright light source. */
    High: 2,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LightLevel = ValuesOf<typeof LightLevel>;
