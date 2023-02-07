import { useCallback, useContext, useMemo } from 'react';
import { Button, Collapse, LinearProgress, Slide, Stack, Typography } from '@mui/material';
import { aims } from '../../../api';
import { messages } from '../../../constants';
import { SettingsContext, UserSessionContext } from '../../../contexts';
import { hasOneOfPermissions } from '../../../helpers';
import { useActionState } from '../../../hooks';
import { UserPermissions } from '../../../types';

import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';

export interface ApproveRejectProps {
    postId: string;
    onApprove: () => void;
    onReject: () => void;
    slideIn: boolean;
}

const ApproveReject = ({ postId, onApprove, onReject, slideIn }: ApproveRejectProps) => {
    const { settings } = useContext(SettingsContext);
    const { user } = useContext(UserSessionContext);

    const { status, output, setSuccess, setError, setIdle, setInProgress } = useActionState();

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

    const handleAccept = useCallback(() => {
        if (user?.siteToken === undefined) return;
        if (status !== 'inProgress') return;

        setInProgress('Approving...');

        aims.acceptSubmission(
            {
                baseURL: settings.serverUrl,
                siteToken: user.siteToken,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            postId,
        ).then((res) => {
            if (res === 'aborted') setIdle();
            else if (res.success) setSuccess('Approved');
            else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 401) setError(messages[401](res.data));
            else if (res.status === 403) setError(messages[403]());
            else if (res.status === 404) setError('Submission Not Found');
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });
    }, [
        postId,
        setError,
        setIdle,
        setInProgress,
        setSuccess,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        status,
        user?.siteToken,
    ]);

    const handleReject = useCallback(() => {
        if (user?.siteToken === undefined) return;
        if (status !== 'inProgress') return;

        setInProgress('Rejecting...');

        aims.rejectSubmission(
            {
                baseURL: settings.serverUrl,
                siteToken: user.siteToken,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            postId,
        ).then((res) => {
            if (res === 'aborted') setIdle();
            else if (res.success) setSuccess('Rejected');
            else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 401) setError(messages[401](res.data));
            else if (res.status === 403) setError(messages[403]());
            else if (res.status === 404) setError('Submission Not Found');
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });
    }, [
        postId,
        setError,
        setIdle,
        setInProgress,
        setSuccess,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        status,
        user?.siteToken,
    ]);

    if (!canEdit) return <></>;

    return (
        <>
            <Slide in={slideIn} direction="right">
                <Stack direction="row" sx={{ mt: 2 }} spacing={2}>
                    <Button
                        variant="contained"
                        fullWidth
                        color="success"
                        size="large"
                        startIcon={<DoneIcon />}
                        onClick={handleAccept}
                        disabled={status === 'inProgress' || status === 'success'}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        color="error"
                        size="large"
                        startIcon={<DeleteIcon />}
                        onClick={handleReject}
                        disabled={status === 'inProgress' || status === 'success'}
                    >
                        Reject
                    </Button>
                </Stack>
            </Slide>
            <Collapse in={status === 'inProgress'}>
                <Stack>
                    <Typography variant="h5" textAlign="center" gutterBottom sx={{ mt: 1 }}>
                        {output}
                    </Typography>
                    <LinearProgress />
                </Stack>
            </Collapse>
            <Collapse in={status === 'errored'}>
                <Typography variant="h5" textAlign="center" color="lightcoral" sx={{ mt: 1 }}>
                    {output}
                </Typography>
            </Collapse>
            <Collapse in={status === 'success'}>
                <Typography variant="h5" textAlign="center" color="lightgreen" sx={{ mt: 1 }}>
                    {output}
                </Typography>
            </Collapse>
        </>
    );
};

export default ApproveReject;
