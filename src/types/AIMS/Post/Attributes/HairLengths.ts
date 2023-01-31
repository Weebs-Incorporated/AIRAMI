import { ValuesOf } from '../../Utility';

export const HairLengths = {
    Bald: 1 << 0,

    /** Down to chin. */
    Short: 1 << 1,

    /** Past the chin. */
    Long: 1 << 2,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type HairLengths = ValuesOf<typeof HairLengths>;
