import { ValuesOf } from '../../Utility';

export const ArtStyle = {
    Standard: 0,

    /** Usually characterised by more pronounced strokes and rougher outlines. */
    Sketch: 1,

    Esoteric: 2,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ArtStyle = ValuesOf<typeof ArtStyle>;
