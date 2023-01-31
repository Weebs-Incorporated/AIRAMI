import { ReactNode } from 'react';
import { Link } from '@mui/material';
import { ExternalLink } from '../Links';

import { ArtStyle } from '../../types/AIMS/Post/Attributes/ArtStyle';
import { Colours } from '../../types/AIMS/Post/Attributes/Colours';
import { ExplicitLevel } from '../../types/AIMS/Post/Attributes/ExplicitLevel';
import { HairLengths } from '../../types/AIMS/Post/Attributes/HairLengths';
import { LightLevel } from '../../types/AIMS/Post/Attributes/LightLevel';
import { Outfits } from '../../types/AIMS/Post/Attributes/Outfits';
import { Races } from '../../types/AIMS/Post/Attributes/Races';
import { ShotType } from '../../types/AIMS/Post/Attributes/ShotType';
import { Themes } from '../../types/AIMS/Post/Attributes/Themes';

export type DescMap<T extends string | number | symbol> = { [k in T]?: ReactNode };

export const artStyleDescription: DescMap<ArtStyle> = {
    [ArtStyle.Sketch]: 'Usually characterised by more pronounced strokes and rougher outlines.',
};

export const explicitLevelDescription: DescMap<ExplicitLevel> = {
    [ExplicitLevel.Safe]: 'Nothing even slightly sexualised.',
    [ExplicitLevel.Low]: 'Some aspects of the image may be slightly sexualised.',
    [ExplicitLevel.Medium]: 'Some aspects of the image are sexualised, but not overwhelmingly.',
};

export const hairLengthsDescription: DescMap<HairLengths> = {
    [HairLengths.Short]: 'Down to chin.',
    [HairLengths.Long]: 'Past the chin.',
};

export const lightLevelDescription: DescMap<LightLevel> = {
    [LightLevel.Low]: 'Black/very dark background.',
    [LightLevel.High]: 'Pure white background, and/or very bright light source.',
};

export const outfitsDescription: DescMap<Outfits> = {
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
};

export const racesDescription: DescMap<Races> = {
    [Races.Kemonomimi]:
        'Blanket term for any animal-like features. Use this alongside other races, and by itself if you cannot distinguish.',
};

export const shotTypeDescription: DescMap<ShotType> = {
    [ShotType.CloseUp]: "Filled with a subject's face or an important feature.",
    [ShotType.MidShot]: 'Shows the subject from the waist up.',
    [ShotType.ExtremeLongShot]:
        'People, if present, appear as indistinct (or otherwise undetailed) shapes; normally images of landscapes.',
};

export const themesDescription: DescMap<Themes> = {};

export const eyeColoursDescription: DescMap<Colours> = {};

export const hairColoursDescription: DescMap<Colours> = {
    [Colours.Brown]: 'Brunette goes here too.',
};
