import { ReactNode, useContext, useEffect, useState } from 'react';
import { Typography, Grid, Collapse, Paper, Stack, Divider, Button, Slide, LinearProgress } from '@mui/material';
import InlineUser from '../../components/InlineUser';
import RelativeTimeString from '../../components/RelativeTimeString';
import { SettingsContext, UserSession } from '../../contexts';
import { ClientFacingUser, PostProperties, PostStatus } from '../../types';
import { useStaggered } from '../../hooks';
import { aims } from '../../api';
import { messages } from '../../constants';

import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';

export interface PropertiesSectionProps {
    id: string;
    properties: PostProperties<PostStatus.InitialAwaitingValidation>;
    uploader: ClientFacingUser | null;
    lastModifier: ClientFacingUser | null;
    canEdit: boolean;
    loggedInUser: UserSession;
}

/** {@link https://stackoverflow.com/a/73974452/15257167} */
const byteValueNumberFormatter = Intl.NumberFormat('en', {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
});

const Property = ({ name, value, slideIn }: { name: string; value: ReactNode; slideIn: boolean }) => (
    <Slide direction="right" in={slideIn}>
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pt: 1, pb: 1 }}>
            <Typography sx={{ minWidth: '130px' }} whiteSpace="nowrap">
                {name}
            </Typography>
            {value}
        </Stack>
    </Slide>
);

const PropertiesSection = (props: PropertiesSectionProps) => {
    const { id, properties, uploader, lastModifier, canEdit, loggedInUser } = props;

    const { settings } = useContext(SettingsContext);

    const [loaded, setLoaded] = useState(true);

    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState<'approved' | 'rejected'>();

    const { beginTimer, shouldStart } = useStaggered([400, 100], 7);

    useEffect(() => {
        if (loaded) beginTimer();
    }, [beginTimer, loaded]);

    useEffect(() => {
        if (!isApproving || success) return;

        setError('');

        const controller = new AbortController();

        aims.acceptSubmission(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            id,
        ).then((res) => {
            if (res === 'aborted') return;
            if (res.success) {
                setIsApproving(false);
                setSuccess('approved');
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
        isApproving,
        isRejecting,
        loggedInUser.siteToken,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        success,
    ]);

    useEffect(() => {
        if (!isRejecting || success) return;

        setError('');

        const controller = new AbortController();

        aims.rejectSubmission(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            id,
        ).then((res) => {
            if (res === 'aborted') return;
            if (res.success) {
                setIsRejecting(false);
                setSuccess('rejected');
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
        isApproving,
        isRejecting,
        loggedInUser.siteToken,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        success,
    ]);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={6} lg={7} xl={8}>
                <img
                    src={`${settings.serverUrl}/images/${id}`}
                    alt="submission"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={5} xl={4}>
                <div style={{ height: '100%' }}>
                    <Collapse in={shouldStart(0)} sx={{ position: 'sticky', top: '10px' }}>
                        <Paper elevation={10} sx={{ p: 1, overflowX: 'hidden' }}>
                            <Stack divider={<Divider />}>
                                <Typography variant="h5" sx={{ pt: 2, pb: 2 }}>
                                    {id}
                                </Typography>
                                <Property
                                    slideIn={shouldStart(1)}
                                    name="Size"
                                    value={
                                        <>
                                            {byteValueNumberFormatter.format(properties.size)}{' '}
                                            <span style={{ color: 'gray', whiteSpace: 'nowrap' }}>
                                                ({properties.size.toLocaleString('en-NZ')} Bytes)
                                            </span>
                                        </>
                                    }
                                />
                                <Property
                                    slideIn={shouldStart(2)}
                                    name="Dimensions"
                                    value={
                                        <>
                                            {properties.dimensions.width} x {properties.dimensions.height}
                                        </>
                                    }
                                />
                                <Property
                                    slideIn={shouldStart(3)}
                                    name="Uploader"
                                    value={
                                        <Typography alignItems="center" sx={{ display: 'flex' }} whiteSpace="nowrap">
                                            <InlineUser user={uploader ?? properties.uploaded.by} />
                                            {uploader && (
                                                <>
                                                    &nbsp;({uploader.posts} Post
                                                    {uploader.posts !== 1 ? 's' : ''})
                                                </>
                                            )}
                                        </Typography>
                                    }
                                />
                                <Property
                                    slideIn={shouldStart(4)}
                                    name="Uploaded"
                                    value={
                                        <span title={new Date(properties.uploaded.at).toUTCString()}>
                                            {new Date(properties.uploaded.at).toLocaleDateString('en-NZ')}{' '}
                                            <RelativeTimeString time={properties.uploaded.at} inBrackets color="gray" />
                                        </span>
                                    }
                                />
                                <Property
                                    slideIn={shouldStart(5)}
                                    name="Last Modified"
                                    value={
                                        <Typography alignItems="center" sx={{ display: 'flex' }} whiteSpace="nowrap">
                                            <InlineUser user={lastModifier ?? properties.lastModified.by} />
                                        </Typography>
                                    }
                                />

                                <Property
                                    slideIn={shouldStart(6)}
                                    name="Modified"
                                    value={
                                        <span title={new Date(properties.lastModified.at).toUTCString()}>
                                            {new Date(properties.lastModified.at).toLocaleDateString('en-NZ')}{' '}
                                            <RelativeTimeString
                                                time={properties.lastModified.at}
                                                inBrackets
                                                color="gray"
                                            />
                                        </span>
                                    }
                                />

                                {canEdit && (
                                    <>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            color="success"
                                            size="large"
                                            startIcon={<DoneIcon />}
                                            sx={{ mt: 2 }}
                                            onClick={() => setIsApproving(true)}
                                            disabled={!!success || isApproving || isRejecting}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            color="error"
                                            size="large"
                                            startIcon={<DeleteIcon />}
                                            sx={{ mt: 2 }}
                                            onClick={() => setIsRejecting(true)}
                                            disabled={!!success || isApproving || isRejecting}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </Stack>
                            <Collapse in={isApproving}>
                                <Stack>
                                    <Typography variant="h5" textAlign="center" gutterBottom sx={{ mt: 1 }}>
                                        Approving...
                                    </Typography>
                                    <LinearProgress />
                                </Stack>
                            </Collapse>
                            <Collapse in={isRejecting}>
                                <Stack>
                                    <Typography variant="h5" textAlign="center" gutterBottom sx={{ mt: 1 }}>
                                        Rejecting...
                                    </Typography>
                                    <LinearProgress />
                                </Stack>
                            </Collapse>
                            <Collapse in={error !== ''}>
                                <Typography variant="h5" textAlign="center" color="lightcoral" sx={{ mt: 1 }}>
                                    {error}
                                </Typography>
                            </Collapse>
                            <Collapse in={!!success}>
                                <Typography
                                    variant="h5"
                                    textAlign="center"
                                    color={success === 'approved' ? 'lightgreen' : 'lightcoral'}
                                    textTransform="capitalize"
                                    sx={{ mt: 1 }}
                                >
                                    {success}
                                </Typography>
                            </Collapse>
                        </Paper>
                    </Collapse>
                </div>
            </Grid>
        </Grid>
    );
};

export default PropertiesSection;
