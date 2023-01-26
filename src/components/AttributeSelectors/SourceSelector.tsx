import { Checkbox, Fade, FormControlLabel, FormGroup, Grid, TextField, Typography } from '@mui/material';
import { ChangeEvent, SyntheticEvent, useCallback } from 'react';
import { Post, PostStatus } from '../../types/AIMS';
import { Source } from '../../types/AIMS/Post/Attributes';

export interface SourceSelectorProps {
    sources: Post<PostStatus.InitialAwaitingValidation>['sources'];
    setSources: (newSources: Post<PostStatus.InitialAwaitingValidation>['sources']) => void;
}

const sourceOptions = Object.values(Source).filter((e) => typeof e !== 'string') as Source[];

const sourceExamples: Record<Source, { post: string; account: string }> = {
    [Source.Pixiv]: {
        post: 'https://www.pixiv.net/en/artworks/1234567890',
        account: 'https://www.pixiv.net/en/users/12345',
    },
    [Source.Twitter]: {
        post: 'https://twitter.com/nachotoast_123/status/1234567890',
        account: 'https://twitter.com/nachotoast_123',
    },
    [Source.DeviantArt]: {
        post: `https://www.deviantart.com/nachotoast_123/art/some-post-${new Date().getFullYear()}-1234567890`,
        account: 'https://www.deviantart.com/nachotoast_123',
    },
    [Source.Other]: {
        post: 'ArtStation, Weibo, etc...',
        account: 'ArtStation, Weibo, etc...',
    },
};

const SourceSelector = (props: SourceSelectorProps) => {
    const { sources, setSources } = props;

    const handleCheck = useCallback(
        (source: Source) => (_e: SyntheticEvent, checked: boolean) => {
            const newSources: Post<PostStatus.InitialAwaitingValidation>['sources'] = { ...sources };

            if (checked) {
                newSources[source] = { post: '', account: '' };
                setSources({ ...newSources });
            } else {
                delete newSources[source];
                setSources({ ...newSources });
            }
        },
        [setSources, sources],
    );

    const handleValueChange = useCallback(
        (source: Source, key: 'post' | 'account') => (e: ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            const existing = sources[source];
            if (existing === undefined) return;
            existing[key] = e.target.value;
            setSources({ ...sources, [source]: existing });
        },
        [setSources, sources],
    );

    return (
        <Grid container item spacing={2} xs={12}>
            <Grid item xs={12}>
                <Typography variant="h6">Sources</Typography>
                <Typography color="gray">Must have at least 1</Typography>
            </Grid>
            {sourceOptions.map((e) => (
                <Grid item xs={12} key={e}>
                    <FormGroup>
                        <Grid container spacing={1}>
                            <Grid item>
                                <FormControlLabel
                                    sx={{ minWidth: '132px' }}
                                    control={<Checkbox checked={!!sources[e]} />}
                                    label={Source[e]}
                                    onChange={handleCheck(e)}
                                />
                            </Grid>
                            <Grid item sx={{ flexGrow: 1 }}>
                                <Fade in={!!sources[e]}>
                                    <TextField
                                        fullWidth
                                        inputMode="url"
                                        name={`source${Source[e]}Post`}
                                        label={`${Source[e]} Post Link`}
                                        InputLabelProps={{ shrink: true }}
                                        value={sources[e]?.post ?? ''}
                                        onChange={handleValueChange(e, 'post')}
                                        placeholder={sourceExamples[e].post}
                                    />
                                </Fade>
                            </Grid>
                            <Grid item sx={{ flexGrow: 1 }}>
                                <Fade in={!!sources[e]}>
                                    <TextField
                                        fullWidth
                                        inputMode="url"
                                        name={`source${Source[e]}Author`}
                                        label={`${Source[e]} Account Link`}
                                        InputLabelProps={{ shrink: true }}
                                        onChange={handleValueChange(e, 'account')}
                                        placeholder={sourceExamples[e].account}
                                    />
                                </Fade>
                            </Grid>
                        </Grid>
                    </FormGroup>
                </Grid>
            ))}
        </Grid>
    );
};

export default SourceSelector;
