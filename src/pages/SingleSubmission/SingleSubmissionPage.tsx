import { useContext, useEffect, useState } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { aims } from '../../api';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs';
import { messages } from '../../constants';
import { SettingsContext, UserSessionContext } from '../../contexts';
import { Post, PostStatus } from '../../types';
import NotLoggedInPage from '../NotLoggedIn/NotLoggedInPage';
import { Page } from '../Page.styled';

import SinglePost from '../../components/SinglePost';

import { useActionState } from '../../hooks';

const SingleSubmissionPage = () => {
    const { user: loggedInUser } = useContext(UserSessionContext);
    const { settings } = useContext(SettingsContext);
    const { id } = useParams();

    const [submission, setSubmission] = useState<Post<PostStatus.InitialAwaitingValidation>>();

    const { status, output, setSuccess, setError, setIdle, setInProgress } = useActionState();

    useEffect(() => {
        // don't try fetching the submission if not desired
        if (status !== 'inProgress') return;

        // don't try fetching the submission if not logged in
        if (loggedInUser?.siteToken === undefined) return;

        // don't try fetching the submission if no ID is specified
        if (id === undefined) return;

        // don't try fetching the submissison if we've already fetched it
        if (submission?._id === id) return;

        const controller = new AbortController();

        aims.getSubmission(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            id,
        ).then((res) => {
            if (res === 'aborted') setIdle();
            else if (res.success) {
                setSuccess();
                setSubmission(res.data);
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
        loggedInUser?.siteToken,
        setError,
        setIdle,
        setSuccess,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        status,
        submission?._id,
    ]);

    useEffect(() => {
        setInProgress();
    }, [setInProgress]);

    if (id === undefined) {
        return (
            <>
                <SiteBreadcrumbs
                    items={[
                        { to: '/', text: 'Home' },
                        { to: '/submissions', text: 'Submissions' },
                    ]}
                />
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h2">Error</Typography>
                <Typography variant="subtitle2" color="gray">
                    The URL seems to be invalid.
                </Typography>
                <HomeButton sx={{ mt: 3 }} />
                <Footer />
            </>
        );
    }

    if (loggedInUser === null) {
        return <NotLoggedInPage breadcrumbItems={[{ to: '/submissions', text: 'Submissions' }]} />;
    }

    if (status === 'errored') {
        return (
            <>
                <SiteBreadcrumbs
                    items={[
                        { to: '/', text: 'Home' },
                        { to: '/submissions', text: 'Submissions' },
                    ]}
                />
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h2">Error</Typography>
                <Typography variant="subtitle2" color="gray">
                    {output}
                </Typography>
                <HomeButton sx={{ mt: 3 }} />
                <Footer />
            </>
        );
    }

    if (submission?._id !== id) {
        return (
            <>
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h2">Loading</Typography>
                <Typography variant="subtitle2" color="gray">
                    Fetching Submission...
                </Typography>
                <CircularProgress size={60} sx={{ mt: 3 }} />
                <Footer />
            </>
        );
    }

    return (
        <>
            <SiteBreadcrumbs
                items={[
                    { to: '/', text: 'Home' },
                    { to: '/submissions', text: 'Submissions' },
                ]}
            />
            <Page maxWidth="xl">
                <SinglePost post={submission} onUpdate={setSubmission} />
                <Footer />
            </Page>
        </>
    );
};

export default SingleSubmissionPage;
