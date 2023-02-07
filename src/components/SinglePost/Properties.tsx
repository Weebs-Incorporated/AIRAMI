import { ReactNode, useContext, useEffect, useState } from 'react';
import { Typography, Grid, Collapse, Paper, Stack, Divider, Slide } from '@mui/material';
import InlineUser from '../InlineUser';
import RelativeTimeString from '../RelativeTimeString';
import { SettingsContext } from '../../contexts';
import { ClientFacingUser, PostProperties, PostStatus } from '../../types';
import { useStaggered } from '../../hooks';
import ApproveReject from './PropertiesActions/ApproveReject';
import Withdraw from './PropertiesActions/Withdraw';

export interface PropertiesProps {
    id: string;
    properties: PostProperties<PostStatus>;
    uploader: ClientFacingUser | null;
    approver: ClientFacingUser | null;
    withdrawer: ClientFacingUser | null;
    lastModifier: ClientFacingUser | null;
    onStatusUpdate: (newStatus: PostStatus) => void;
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

const Properties = (props: PropertiesProps) => {
    const { id, properties, uploader, approver, withdrawer, lastModifier, onStatusUpdate } = props;

    const { settings } = useContext(SettingsContext);

    const [loaded, setLoaded] = useState(true);

    const { beginTimer, shouldStart } = useStaggered([400, 100], 7);

    useEffect(() => {
        if (loaded) beginTimer();
    }, [beginTimer, loaded]);

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
                                    name="Status"
                                    value={PostStatus[properties.status]}
                                />
                                <Property
                                    slideIn={shouldStart(4)}
                                    name="Uploaded"
                                    value={
                                        <Stack spacing={1}>
                                            <Typography
                                                alignItems="center"
                                                sx={{ display: 'flex' }}
                                                whiteSpace="nowrap"
                                            >
                                                <InlineUser user={uploader ?? properties.uploaded.by} />
                                                {uploader && (
                                                    <>
                                                        &nbsp;({uploader.posts} Post
                                                        {uploader.posts !== 1 ? 's' : ''})
                                                    </>
                                                )}
                                            </Typography>
                                            <span title={new Date(properties.uploaded.at).toUTCString()}>
                                                {new Date(properties.uploaded.at).toLocaleDateString('en-NZ')}{' '}
                                                <RelativeTimeString
                                                    time={properties.uploaded.at}
                                                    inBrackets
                                                    color="gray"
                                                />
                                            </span>
                                        </Stack>
                                    }
                                />
                                {!!properties.approved && (
                                    <Property
                                        slideIn={shouldStart(5)}
                                        name="Approved"
                                        value={
                                            <Stack spacing={1}>
                                                <Typography
                                                    alignItems="center"
                                                    sx={{ display: 'flex' }}
                                                    whiteSpace="nowrap"
                                                >
                                                    <InlineUser user={approver ?? properties.approved.by} />
                                                </Typography>
                                                <span title={new Date(properties.approved.at).toUTCString()}>
                                                    {new Date(properties.approved.at).toLocaleDateString('en-NZ')}{' '}
                                                    <RelativeTimeString
                                                        time={properties.approved.at}
                                                        inBrackets
                                                        color="gray"
                                                    />
                                                </span>
                                            </Stack>
                                        }
                                    />
                                )}
                                {!!properties.withdrawn && (
                                    <Property
                                        slideIn={shouldStart(5)}
                                        name="Withdrawn"
                                        value={
                                            <Stack spacing={1}>
                                                <Typography
                                                    alignItems="center"
                                                    sx={{ display: 'flex' }}
                                                    whiteSpace="nowrap"
                                                >
                                                    <InlineUser user={withdrawer ?? properties.withdrawn.by} />
                                                </Typography>
                                                <span title={new Date(properties.withdrawn.at).toUTCString()}>
                                                    {new Date(properties.withdrawn.at).toLocaleDateString('en-NZ')}{' '}
                                                    <RelativeTimeString
                                                        time={properties.withdrawn.at}
                                                        inBrackets
                                                        color="gray"
                                                    />
                                                </span>
                                            </Stack>
                                        }
                                    />
                                )}
                                <Property
                                    slideIn={shouldStart(5)}
                                    name="Last Modified"
                                    value={
                                        <Stack spacing={1}>
                                            <Typography
                                                alignItems="center"
                                                sx={{ display: 'flex' }}
                                                whiteSpace="nowrap"
                                            >
                                                <InlineUser user={lastModifier ?? properties.lastModified.by} />
                                            </Typography>
                                            <span title={new Date(properties.lastModified.at).toUTCString()}>
                                                {new Date(properties.lastModified.at).toLocaleDateString('en-NZ')}{' '}
                                                <RelativeTimeString
                                                    time={properties.lastModified.at}
                                                    inBrackets
                                                    color="gray"
                                                />
                                            </span>
                                        </Stack>
                                    }
                                />
                                {properties.status === PostStatus.InitialAwaitingValidation ? (
                                    <ApproveReject
                                        postId={id}
                                        onApprove={() => onStatusUpdate(PostStatus.Public)}
                                        onReject={() => null}
                                        slideIn={shouldStart(6)}
                                    />
                                ) : properties.status === PostStatus.Public ? (
                                    <Withdraw
                                        postId={id}
                                        onWithdraw={() => onStatusUpdate(PostStatus.ReAwaitingValidation)}
                                        slideIn={shouldStart(6)}
                                    />
                                ) : (
                                    <></>
                                )}
                            </Stack>
                        </Paper>
                    </Collapse>
                </div>
            </Grid>
        </Grid>
    );
};

export default Properties;
