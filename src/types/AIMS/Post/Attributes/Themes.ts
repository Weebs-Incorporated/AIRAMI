import { ValuesOf } from '../../Utility';

export const Themes = {
    Halloween: 1 << 0,
    Christmas: 1 << 1,
    Birthday: 1 << 2,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Themes = ValuesOf<typeof Themes>;
