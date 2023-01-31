import { ArtStyle } from './ArtStyle';
import { Colours } from './Colours';
import { ExplicitLevel } from './ExplicitLevel';
import { HairLengths } from './HairLengths';
import { LightLevel } from './LightLevel';
import { Outfits } from './Outfits';
import { Races } from './Races';
import { ShotType } from './ShotType';
import { Source } from './Source';
import { Themes } from './Themes';

/**
 * Post attributes describe the image of a post.
 *
 * These aspects are manually supplied by the creator/editor of a post.
 *
 * For other aspects of a post, see PostProperties.
 */
export interface PostAttributes {
    /**
     * The (main) universe the post belongs to.
     *
     * Normally this will be the name of a series or game.
     *
     * Can be "unknown", should never permanently be this however.
     *
     * Can be `null` if the universe is an original.
     *
     * @example "arknights", "konosuba", "re:zero", "overwatch"
     */
    universe: string | null;

    /** Might not be in English. */
    artistName: string;

    /** Names of any noteworthy figures in the post. */
    characters: string[];

    /** Links to this post this image is in and it's author. */
    sources: { [K in Source]?: { post: string; account: string } };

    /** Array of post ID's that were uploaded with this image. */
    accompanyingImages: string[];

    artStyle: ArtStyle;

    explicitLevel: ExplicitLevel;

    hairLengths: HairLengths;

    lightLevel: LightLevel;

    outfits: Outfits;

    races: Races;

    shotType: ShotType;

    themes: Themes;

    hairColours: Colours;

    eyeColours: Colours;
}
