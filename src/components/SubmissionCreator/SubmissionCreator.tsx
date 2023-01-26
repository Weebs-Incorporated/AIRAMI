import {
    Autocomplete,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    GridProps,
    Skeleton,
    TextField,
    TextFieldProps,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SettingsContext, UserSession } from '../../contexts';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {
    ArtStyle,
    Colours,
    ExplicitLevel,
    HairLengths,
    LightLevel,
    Outfits,
    Races,
    ShotType,
    Themes,
} from '../../types/AIMS/Post/Attributes';
import { Post, PostAttributes, PostStatus } from '../../types/AIMS';
import {
    SingleSelector,
    artStyleDescription,
    explicitLevelDescription,
    MultiSelector,
    hairLengthsDescription,
    lightLevelDescription,
    outfitsDescription,
    racesDescription,
    shotTypeDescription,
    themesDescription,
    hairColoursDescription,
    eyeColoursDescription,
    SourceSelector,
} from '../AttributeSelectors';
import { aims } from '../../api';

export interface SubmissionEditorProps {
    loggedInUser: UserSession;
    onClose: () => void;
    open: boolean;
}

function getLinkType(url: URL): PostAttributes.Source | null {
    if (url.host === 'i.pximg.net') return PostAttributes.Source.Pixiv;
    if (url.host === 'pbs.twimg.com') return PostAttributes.Source.Twitter;
    if (url.host.startsWith('images-wixmp')) return PostAttributes.Source.DeviantArt;
    if (url.host === 'cdn.aims.nachotoast.com') return PostAttributes.Source.Other;
    return null;
}

const DialogItem = ({ children, ...rest }: GridProps) => (
    <Grid item xs={12} md={6} xl={4} {...rest}>
        {children}
    </Grid>
);

// type Submission = Partial<AIMS.Post<AIMS.PostStatus.InitialAwaitingValidation>> & { url: string };

const SubmissionCreator = (props: SubmissionEditorProps) => {
    const { loggedInUser, onClose, open } = props;

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const { settings } = useContext(SettingsContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [output, setOutput] = useState<[ReactNode, 'success' | 'fail']>(['', 'success']);

    const [rawUrl, setRawUrl] = useState('');
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [sources, setSources] = useState<Post<PostStatus.InitialAwaitingValidation>['sources']>({});
    const [universe, setUniverse] = useState<string | null>(null);
    const [artistName, setArtistName] = useState<string>('');
    const [characters, setCharacters] = useState<string[]>([]);
    const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.Standard);
    const [explicitLevel, setExplicitLevel] = useState<ExplicitLevel>(ExplicitLevel.Low);
    const [hairLengths, setHairLengths] = useState<HairLengths>(0);
    const [lightLevel, setLightLevel] = useState<LightLevel>(LightLevel.Medium);
    const [outfits, setOufits] = useState<Outfits>(0);
    const [races, setRaces] = useState<Races>(0);
    const [shotType, setShotType] = useState<ShotType>(ShotType.MidShot);
    const [themes, setThemes] = useState<Themes>(0);
    const [hairColours, setHairColours] = useState<Colours>(0);
    const [eyeColours, setEyeColours] = useState<Colours>(0);

    const [imageError, setImageError] = useState<boolean | undefined>();

    const url = useMemo(() => {
        try {
            return new URL(rawUrl);
        } catch (error) {
            return undefined;
        }
    }, [rawUrl]);

    const source = useMemo(() => {
        if (url === undefined) return undefined;
        return getLinkType(url);
    }, [url]);

    const imgSrc = useMemo(() => {
        switch (source) {
            case undefined:
                return undefined;
            case PostAttributes.Source.Pixiv:
                return `${settings.serverUrl}/image/${encodeURIComponent(rawUrl)}`;
            default:
                return rawUrl;
        }
    }, [rawUrl, settings.serverUrl, source]);

    const urlHelperText = useMemo<[string, Exclude<TextFieldProps['color'], undefined>]>(() => {
        if (rawUrl === '') return ['Image URL', 'primary'];
        if (url === undefined || imageError) return ['Not a valid URL', 'error'];
        if (source === null) return ['Must be a URL from a verified source', 'error'];
        if (imageError === undefined) return ['Checking...', 'warning'];
        return ['Valid URL', 'success'];
    }, [imageError, rawUrl, source, url]);

    const [canSubmit, preSubmitText] = useMemo(() => {
        if (urlHelperText[1] !== 'success') return [false, 'Image URL must be valid.'];
        if (artistName === '') return [false, 'Missing artist name.'];

        const sourceValues = Object.values(sources);
        if (sourceValues.length < 1) return [false, 'Need at least 1 source.'];

        if (sourceValues.some((e) => e.account === '' || e.post === '')) {
            return [false, 'Missing source URLs'];
        }

        return [true, ''];
    }, [artistName, sources, urlHelperText]);

    const resetAllValues = useCallback(() => {
        setRawUrl('');
        setDimensions({ width: 0, height: 0 });
        setSources({});
        setUniverse(null);
        setArtistName('');
        setCharacters([]);
        setArtStyle(ArtStyle.Standard);
        setExplicitLevel(ExplicitLevel.Low);
        setHairLengths(0);
        setLightLevel(LightLevel.Medium);
        setOufits(0);
        setRaces(0);
        setShotType(ShotType.MidShot);
        setThemes(0);
        setHairColours(0);
        setEyeColours(0);
    }, []);

    useEffect(() => setImageError(undefined), [rawUrl]);

    const handleSubmit = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();

            setIsSubmitting(true);

            aims.makeSubmission(
                {
                    baseURL: settings.serverUrl,
                    siteToken: loggedInUser.siteToken,
                    rateLimitBypassToken: settings.rateLimitBypassToken,
                },
                {
                    url: rawUrl,
                    dimensions,
                    sources,
                    universe,
                    artistName,
                    characters,
                    artStyle,
                    explicitLevel,
                    hairLengths,
                    lightLevel,
                    outfits,
                    races,
                    shotType,
                    themes,
                    hairColours,
                    eyeColours,
                },
            ).then((res) => {
                if (res === 'aborted') setOutput(['Submission creation was aborted.', 'fail']);
                else if (res.success) {
                    console.log(res.data);
                    setOutput([<span>Submission created!</span>, 'success']);
                    resetAllValues();
                } else if (res.generic) {
                    setOutput([`Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`, 'fail']);
                } else {
                    switch (res.status) {
                        case 401:
                            setOutput(['Invalid credentials, logging out is recommended.', 'fail']);
                            break;
                        case 409:
                            setOutput(['A post with this file name already exists.', 'fail']);
                            break;
                        case 429:
                            setOutput([`Rate limited, try again in ${res.data.reset} seconds.`, 'fail']);
                            break;
                        case 501:
                            setOutput(['Posts database not enabled.', 'fail']);
                            break;
                        default:
                            throw res;
                    }
                }
                setIsSubmitting(false);
            });
        },
        [
            artStyle,
            artistName,
            characters,
            dimensions,
            explicitLevel,
            eyeColours,
            hairColours,
            hairLengths,
            lightLevel,
            loggedInUser.siteToken,
            outfits,
            races,
            rawUrl,
            resetAllValues,
            settings.rateLimitBypassToken,
            settings.serverUrl,
            shotType,
            sources,
            themes,
            universe,
        ],
    );

    return (
        <Dialog maxWidth="xl" fullScreen={fullScreen} open={isSubmitting || open} onClose={onClose}>
            <DialogTitle textAlign="center">New Submission</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <DialogItem sm={6}>
                        {imageError ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    flexDirection: 'column',
                                    color: 'gray',
                                }}
                            >
                                <Typography>Error Fetching Image</Typography>
                                <ErrorOutlineIcon />
                            </div>
                        ) : imgSrc !== undefined ? (
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={imgSrc}
                                    alt="upload preview"
                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    onError={(e) => {
                                        e.preventDefault();
                                        setImageError(true);
                                    }}
                                    onLoad={(e) => {
                                        e.preventDefault();
                                        setImageError(false);
                                        setDimensions({
                                            width: e.currentTarget.naturalWidth,
                                            height: e.currentTarget.naturalHeight,
                                        });
                                    }}
                                    loading="lazy"
                                />
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    }}
                                >
                                    {dimensions.width} x {dimensions.height}
                                </span>
                            </div>
                        ) : (
                            <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%' }} />
                        )}
                    </DialogItem>
                    <DialogItem sm={6} xl={8} container spacing={2}>
                        <Grid item xs={12} xl={6}>
                            <TextField
                                name="url"
                                fullWidth
                                color={urlHelperText[1]}
                                inputMode="url"
                                label={urlHelperText[0]}
                                error={urlHelperText[1] === 'error'}
                                helperText="Direct link to the image"
                                value={rawUrl}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setRawUrl(e.target.value);
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} xl={6}>
                            <TextField
                                name="universe"
                                variant="filled"
                                fullWidth
                                label="Universe"
                                helperText="Main universe the post belongs to."
                                value={universe ?? ''}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setUniverse(e.target.value || null);
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} xl={6}>
                            <TextField
                                name="artistName"
                                variant="filled"
                                fullWidth
                                label="Artist Name"
                                helperText="Might not be in English."
                                value={artistName}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setArtistName(e.target.value);
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} xl={6}>
                            <Autocomplete
                                multiple
                                value={characters}
                                options={[]}
                                freeSolo
                                renderTags={(value: readonly string[], getTagProps) =>
                                    value.map((option: string, index: number) => (
                                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                    ))
                                }
                                renderInput={(params: object) => (
                                    <TextField
                                        {...params}
                                        name="characters"
                                        variant="outlined"
                                        label={`Characters${characters.length !== 0 ? ` (${characters.length})` : ''}`}
                                        helperText="Names of any noteworthy figures in the post."
                                    />
                                )}
                                onChange={(e, v) => {
                                    e.preventDefault();
                                    setCharacters(v);
                                }}
                            />
                        </Grid>
                    </DialogItem>
                    <DialogItem>
                        <SingleSelector
                            label="Art Style"
                            value={artStyle}
                            setValue={setArtStyle}
                            optionsEnum={ArtStyle}
                            descMap={artStyleDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <SingleSelector
                            label="Explicit Level"
                            value={explicitLevel}
                            setValue={setExplicitLevel}
                            optionsEnum={ExplicitLevel}
                            descMap={explicitLevelDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <MultiSelector
                            label="Hair Lengths"
                            value={hairLengths}
                            setValue={setHairLengths}
                            optionsEnum={HairLengths}
                            descMap={hairLengthsDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <SingleSelector
                            label="Light Level"
                            value={lightLevel}
                            setValue={setLightLevel}
                            optionsEnum={LightLevel}
                            descMap={lightLevelDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <MultiSelector
                            label="Outfits"
                            value={outfits}
                            setValue={setOufits}
                            optionsEnum={Outfits}
                            descMap={outfitsDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <MultiSelector
                            label="Races"
                            value={races}
                            setValue={setRaces}
                            optionsEnum={Races}
                            descMap={racesDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <SingleSelector
                            label="Shot Type"
                            value={shotType}
                            setValue={setShotType}
                            optionsEnum={ShotType}
                            descMap={shotTypeDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <MultiSelector
                            label="Themes"
                            value={themes}
                            setValue={setThemes}
                            optionsEnum={Themes}
                            descMap={themesDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <MultiSelector
                            label="Hair Colours"
                            value={hairColours}
                            setValue={setHairColours}
                            optionsEnum={Colours}
                            descMap={hairColoursDescription}
                        />
                    </DialogItem>
                    <DialogItem>
                        <MultiSelector
                            label="Eye Colours"
                            value={eyeColours}
                            setValue={setEyeColours}
                            optionsEnum={Colours}
                            descMap={eyeColoursDescription}
                        />
                    </DialogItem>
                    <SourceSelector sources={sources} setSources={setSources} />
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={1} justifyContent="flex-end" alignItems="flex-end">
                    {!isSubmitting && !canSubmit && rawUrl !== '' && (
                        <Grid item>
                            <Typography color="lightcoral" sx={{ width: '100%' }}>
                                {preSubmitText}
                            </Typography>
                        </Grid>
                    )}
                    <Grid item xs={12} sm="auto" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                            disabled={isSubmitting || !canSubmit}
                            onClick={handleSubmit}
                            sx={{ width: '100%' }}
                            size="large"
                        >
                            Submit
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm="auto">
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            disabled={isSubmitting}
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                            }}
                            sx={{ width: '100%' }}
                            size="large"
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
            <Collapse in={output[0] !== ''}>
                <DialogContent>
                    <DialogContentText textAlign="center" color={output[1] === 'success' ? 'lightgreen' : 'lightcoral'}>
                        {output[0]}
                    </DialogContentText>
                </DialogContent>
            </Collapse>
        </Dialog>
    );
};

export default SubmissionCreator;
