import { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import {
    Typography,
    Grid,
    TextField,
    Autocomplete,
    Chip,
    Collapse,
    Stack,
    Button,
    GridProps,
    LinearProgress,
} from '@mui/material';
import { SingleSelector, MultiSelector, SourceSelector } from '../AttributeSelectors';
import { SettingsContext, UserSessionContext } from '../../contexts';
import { Post, PostAttributes, PostStatus, UserPermissions } from '../../types';
import { aims } from '../../api';
import { messages } from '../../constants';
import { useActionState } from '../../hooks';
import { hasOneOfPermissions } from '../../helpers';

import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import React from 'react';

export interface AttributesProps<T extends PostStatus> {
    id: string;
    postType: T;
    attributes: PostAttributes;
    onUpdate: (newPost: Post<T>) => void;
}

const DialogItem = ({ children, ...rest }: GridProps) => (
    <Grid item xs={12} md={6} xl={4} {...rest}>
        {children}
    </Grid>
);

const Attributes = <T extends PostStatus>(props: AttributesProps<T>) => {
    const { id, postType, attributes, onUpdate } = props;

    const { settings } = useContext(SettingsContext);
    const { user } = useContext(UserSessionContext);

    const { status, output, setSuccess, setError, setIdle, setInProgress } = useActionState();

    const [newAttributes, setNewAttributes] = useState<PostAttributes>({
        ...attributes,
        characters: [...attributes.characters],
        sources: { ...attributes.sources },
        accompanyingImages: [...attributes.accompanyingImages],
    });

    const hasChangedAttributes = useMemo(
        () => JSON.stringify(newAttributes) !== JSON.stringify(attributes),
        [newAttributes, attributes],
    );

    const canEdit = useMemo(
        () =>
            !!user?.userData.permissions &&
            hasOneOfPermissions(
                user.userData.permissions,
                UserPermissions.Audit,
                UserPermissions.AssignPermissions,
                UserPermissions.Owner,
            ),
        [user?.userData.permissions],
    );

    const isSaving = useMemo(() => status === 'inProgress', [status]);

    const setNumericAttribute = useCallback(
        (attribute: keyof PostAttributes) => {
            return (e: number) => {
                setNewAttributes({ ...newAttributes, [attribute]: e as PostAttributes[typeof attribute] });
            };
        },
        [newAttributes],
    );

    const resetAttributes = useCallback(() => {
        setNewAttributes({
            ...attributes,
            characters: [...attributes.characters],
            sources: { ...attributes.sources },
            accompanyingImages: [...attributes.accompanyingImages],
        });
    }, [attributes]);

    useEffect(resetAttributes, [resetAttributes]);

    useEffect(() => {
        if (user?.siteToken === undefined) return;
        if (status !== 'inProgress') return;

        const controller = new AbortController();

        aims.editPostAttributes(
            {
                baseURL: settings.serverUrl,
                siteToken: user.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            newAttributes,
            id,
            postType,
        ).then((res) => {
            if (res === 'aborted') setIdle();
            else if (res.success) {
                setSuccess();
                onUpdate(res.data);
            } else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 401) setError(messages[401](res.data));
            else if (res.status === 403) setError(messages[403]());
            else if (res.status === 404) setError('Submission Not Found');
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });

        return () => {
            controller.abort();
        };
    }, [
        id,
        newAttributes,
        onUpdate,
        postType,
        setError,
        setIdle,
        setSuccess,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        status,
        user?.siteToken,
    ]);

    return (
        <Grid container spacing={2}>
            <DialogItem>
                <TextField
                    name="universe"
                    variant="filled"
                    fullWidth
                    label="Universe"
                    helperText="Main universe the post belongs to."
                    value={newAttributes.universe ?? ''}
                    onChange={(e) => {
                        e.preventDefault();
                        setNewAttributes({ ...newAttributes, universe: e.target.value ?? null });
                    }}
                    InputLabelProps={{ shrink: true }}
                    disabled={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <TextField
                    name="artistName"
                    variant="filled"
                    fullWidth
                    label="Artist Name"
                    helperText="Might not be in English."
                    value={newAttributes.artistName}
                    onChange={(e) => {
                        e.preventDefault();
                        setNewAttributes({ ...newAttributes, artistName: e.target.value });
                    }}
                    InputLabelProps={{ shrink: true }}
                    disabled={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <Autocomplete
                    multiple
                    value={newAttributes.characters}
                    options={[]}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params: object) => (
                        <TextField
                            {...params}
                            name="characters"
                            variant="outlined"
                            label={`Characters${
                                newAttributes.characters.length !== 0 ? ` (${newAttributes.characters.length})` : ''
                            }`}
                            helperText="Names of any noteworthy figures in the post."
                        />
                    )}
                    onChange={(e, v) => {
                        e.preventDefault();
                        setNewAttributes({ ...newAttributes, characters: v });
                    }}
                    disabled={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <SingleSelector
                    attributeName="artStyle"
                    value={newAttributes.artStyle}
                    setValue={setNumericAttribute('artStyle')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <SingleSelector
                    attributeName="explicitLevel"
                    value={newAttributes.explicitLevel}
                    setValue={setNumericAttribute('explicitLevel')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <MultiSelector
                    attributeName="hairLengths"
                    value={newAttributes.hairLengths}
                    setValue={setNumericAttribute('hairLengths')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <SingleSelector
                    attributeName="lightLevel"
                    value={newAttributes.lightLevel}
                    setValue={setNumericAttribute('lightLevel')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <MultiSelector
                    attributeName="outfits"
                    value={newAttributes.outfits}
                    setValue={setNumericAttribute('outfits')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <MultiSelector
                    attributeName="races"
                    value={newAttributes.races}
                    setValue={setNumericAttribute('races')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <SingleSelector
                    attributeName="shotType"
                    value={newAttributes.shotType}
                    setValue={setNumericAttribute('shotType')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <MultiSelector
                    attributeName="themes"
                    value={newAttributes.themes}
                    setValue={setNumericAttribute('themes')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <MultiSelector
                    attributeName="hairColours"
                    value={newAttributes.hairColours}
                    setValue={setNumericAttribute('hairColours')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <DialogItem>
                <MultiSelector
                    attributeName="eyeColours"
                    value={newAttributes.eyeColours}
                    setValue={setNumericAttribute('eyeColours')}
                    readonly={!canEdit}
                />
            </DialogItem>
            <SourceSelector
                sources={newAttributes.sources}
                setSources={(newSources) => setNewAttributes({ ...newAttributes, sources: newSources })}
                readonly={!canEdit}
            />
            {!!canEdit && (
                <Grid item xs={12}>
                    <Collapse in={hasChangedAttributes}>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                color="success"
                                size="large"
                                startIcon={<SaveIcon />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setInProgress();
                                }}
                                disabled={isSaving}
                            >
                                Save
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                color="error"
                                size="large"
                                startIcon={<RestartAltIcon />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    resetAttributes();
                                }}
                                disabled={isSaving}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Collapse>
                </Grid>
            )}
            <Grid item xs={12}>
                <Collapse in={isSaving}>
                    <Stack>
                        <Typography variant="h5" textAlign="center" gutterBottom>
                            Saving...
                        </Typography>
                        <LinearProgress />
                    </Stack>
                </Collapse>
                <Collapse in={status === 'errored'}>
                    <Typography variant="h5" textAlign="center" color="lightcoral">
                        {output}
                    </Typography>
                </Collapse>
                <Collapse in={status === 'success'}>
                    <Typography variant="h5" textAlign="center" color="lightgreen">
                        Changes Saved
                    </Typography>
                </Collapse>
            </Grid>
        </Grid>
    );
};

export default Attributes;
