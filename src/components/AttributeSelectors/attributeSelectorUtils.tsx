import { ReactNode } from 'react';
import { Link } from '@mui/material';
import { ExternalLink } from '../Links';
import { PostAttributes } from '../../types';
import { Races } from '../../types/AIMS/Post/Attributes/Races';
import { Colours } from '../../types/AIMS/Post/Attributes/Colours';
import { Outfits } from '../../types/AIMS/Post/Attributes/Outfits';
import { ShotType } from '../../types/AIMS/Post/Attributes/ShotType';
import { ArtStyle } from '../../types/AIMS/Post/Attributes/ArtStyle';
import { LightLevel } from '../../types/AIMS/Post/Attributes/LightLevel';
import { HairLengths } from '../../types/AIMS/Post/Attributes/HairLengths';
import { ExplicitLevel } from '../../types/AIMS/Post/Attributes/ExplicitLevel';
import { Themes } from '../../types/AIMS/Post/Attributes/Themes';

export type SingleSelectValues = keyof Pick<PostAttributes, 'artStyle' | 'explicitLevel' | 'lightLevel' | 'shotType'>;

export type MultiSelectValues = keyof Pick<
    PostAttributes,
    'hairLengths' | 'outfits' | 'races' | 'themes' | 'hairColours' | 'eyeColours'
>;

interface SimpleAttribute<T extends SingleSelectValues | MultiSelectValues> {
    label: string;
    values: Record<string, number>;
    names: { [k in PostAttributes[T]]?: string };
    descriptions: { [k in PostAttributes[T]]?: ReactNode };
}

export const attributesDataMap: {
    [k in SingleSelectValues | MultiSelectValues]: SimpleAttribute<k>;
} = {
    artStyle: {
        label: 'Art Style',
        values: ArtStyle,
        names: {},
        descriptions: {
            [ArtStyle.Sketch]: 'Usually characterised by more pronounced strokes and rougher outlines.',
        },
    },
    explicitLevel: {
        label: 'Explicit Level',
        values: ExplicitLevel,
        names: {},
        descriptions: {
            [ExplicitLevel.Safe]: 'Nothing even slightly sexualised.',
            [ExplicitLevel.Low]: 'Some aspects of the image may be slightly sexualised.',
            [ExplicitLevel.Medium]: 'Some aspects of the image are sexualised, but not overwhelmingly.',
        },
    },
    eyeColours: {
        label: 'Eye Colours',
        values: Colours,
        names: {},
        descriptions: {},
    },
    hairColours: {
        label: 'Hair Colours',
        values: Colours,
        names: {},
        descriptions: {
            [Colours.Brown]: 'Brunette goes here too.',
        },
    },
    hairLengths: {
        label: 'Hair Lengths',
        values: HairLengths,
        names: {},
        descriptions: {
            [HairLengths.Short]: 'Down to chin.',
            [HairLengths.Long]: 'Past the chin.',
        },
    },
    lightLevel: {
        label: 'Light Level',
        values: LightLevel,
        names: {},
        descriptions: {
            [LightLevel.Low]: 'Black/very dark background.',
            [LightLevel.High]: 'Pure white background, and/or very bright light source.',
        },
    },
    outfits: {
        label: 'Outfits',
        values: Outfits,
        names: { [Outfits.WeddingDress]: 'Wedding Dress' },
        descriptions: {
            [Outfits.Sailor]: (
                <span>
                    Same as school (
                    <ExternalLink href="https://en.wikipedia.org/wiki/School_uniforms_in_Japan#Sailor_fuku">
                        <Link underline="hover" component="span">
                            fun history lesson
                        </Link>{' '}
                    </ExternalLink>
                    ).
                </span>
            ),
            [Outfits.Hoodie]: 'Must be a big hoodie.',
        },
    },
    races: {
        label: 'Races',
        values: Races,
        names: {},
        descriptions: {
            [Races.Kemonomimi]:
                'Blanket term for any animal-like features. Use this alongside other races, and by itself if you cannot distinguish.',
        },
    },
    shotType: {
        label: 'Shot Type',
        values: ShotType,
        names: {
            [ShotType.CloseUp]: 'Close-up',
            [ShotType.MidShot]: 'Mid-shot (Medium Shot)',
            [ShotType.LongShot]: 'Long-shot',
            [ShotType.ExtremeLongShot]: 'Extreme Long-shot',
        },
        descriptions: {
            [ShotType.CloseUp]: "Filled with a subject's face or an important feature.",
            [ShotType.MidShot]: 'Shows the subject from the waist up.',
            [ShotType.ExtremeLongShot]:
                'People, if present, appear as indistinct (or otherwise undetailed) shapes; normally images of landscapes.',
        },
    },
    themes: {
        label: 'Themes',
        values: Themes,
        names: {},
        descriptions: {},
    },
};
