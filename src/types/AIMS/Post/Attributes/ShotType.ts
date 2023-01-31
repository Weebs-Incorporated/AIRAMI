import { ValuesOf } from '../../Utility';

export const ShotType = {
    /** Filled with a subject's face or an important feature. */
    CloseUp: 0,

    /** Shows the subject from the waist up. */
    MidShot: 1,

    LongShot: 2,

    /** People, if present, appear as indistinct (or otherwise undetailed) shapes; normally images of landscapes. */
    ExtremeLongShot: 3,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ShotType = ValuesOf<typeof ShotType>;
