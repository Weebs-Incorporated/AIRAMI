import { useContext, useEffect, useMemo, useState } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { aims } from '../../api';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs';
import { messages } from '../../constants';
import { SettingsContext, UserSession, UserSessionContext } from '../../contexts';
import { ClientFacingUser, Post, PostStatus, UserPermissions } from '../../types';
import NotLoggedInPage from '../NotLoggedIn/NotLoggedInPage';
import { Page } from '../Page.styled';

import { hasOneOfPermissions } from '../../helpers';
import PropertiesSection from './PropertiesSection';
import AttributesSection from './AttributesSection';

export interface SingleSumbissionsPageProps {
    loggedInUser: UserSession;
    submission: Post<PostStatus.InitialAwaitingValidation>;
    setSubmission: (newSubmisison: Post<PostStatus.InitialAwaitingValidation>) => void;
    uploader: ClientFacingUser | null;
    lastModifier: ClientFacingUser | null;
}

const SingleSubmissionPage = (props: SingleSumbissionsPageProps) => {
    const { loggedInUser, submission, setSubmission, uploader, lastModifier } = props;

    const canEdit = useMemo(
        () =>
            hasOneOfPermissions(
                loggedInUser.userData,
                UserPermissions.Audit,
                UserPermissions.AssignPermissions,
                UserPermissions.Owner,
            ),
        [loggedInUser.userData],
    );

    return (
        <>
            <PropertiesSection
                canEdit={canEdit}
                id={submission._id}
                lastModifier={lastModifier}
                loggedInUser={loggedInUser}
                properties={submission.properties}
                uploader={uploader}
            />
            <Typography variant="h3" gutterBottom textAlign="center" sx={{ mt: 3 }}>
                Attributes
            </Typography>
            <AttributesSection
                attributes={submission.attributes}
                canEdit={canEdit}
                id={submission._id}
                loggedInUser={loggedInUser}
                onUpdate={setSubmission}
            />
        </>
    );
};

const SingleSubmissionPageWrapper = () => {
    const { user: loggedInUser } = useContext(UserSessionContext);
    const { settings } = useContext(SettingsContext);
    const { id } = useParams();

    const [submission, setSubmission] = useState<Post<PostStatus.InitialAwaitingValidation>>();
    const [uploader, setUploader] = useState<ClientFacingUser | null>();
    const [lastModifier, setLastModifier] = useState<ClientFacingUser | null>();

    const [error, setError] = useState<string>();

    useEffect(() => {
        // don't try fetching the submission if not logged in
        if (loggedInUser === null) return;

        // don't try fetching the submission if no ID is specified
        if (id === undefined) return;

        // don't try fetching the submissison if we've already fetched it
        if (submission?._id === id) return;

        setUploader(undefined);
        setLastModifier(undefined);

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
            if (res === 'aborted') return;
            if (res.success) {
                setError(undefined);
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
    }, [id, loggedInUser, settings.rateLimitBypassToken, settings.serverUrl, submission?._id]);

    useEffect(() => {
        // don't try fetching the uploader & modifier if not logged in
        if (loggedInUser === null) return;

        // don't try fetching the uploader & modifier if no submission ID is specified
        if (id === undefined) return;

        // don't try fetching the uploader & modifier if we haven't fetched the right submission yet
        if (submission?._id !== id) return;

        // don't try fetching the uploader & modifier if they haven't changed
        if (
            submission.properties.uploaded.by === uploader?._id &&
            submission.properties.lastModified.by === lastModifier?._id
        ) {
            return;
        }

        // don't bother fetching the uploader & modifier if they are the currently logged in user
        if (
            submission.properties.uploaded.by === loggedInUser.userData._id &&
            submission.properties.lastModified.by === loggedInUser.userData._id
        ) {
            setUploader(loggedInUser.userData);
            setLastModifier(loggedInUser.userData);
            return;
        }

        const controller = new AbortController();

        aims.getSomeUsers(
            {
                baseURL: settings.serverUrl,
                siteToken: undefined,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            [submission.properties.uploaded.by, submission.properties.lastModified.by],
        ).then((res) => {
            if (res === 'aborted') return;
            if (res.success) {
                setError(undefined);
                setUploader(res.data.find((e) => e._id === submission.properties.uploaded.by) ?? null);
                setLastModifier(res.data.find((e) => e._id === submission.properties.lastModified.by) ?? null);
            } else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });

        return () => {
            controller.abort();
        };
    }, [
        id,
        loggedInUser,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        submission?._id,
        uploader?._id,
        lastModifier?._id,
        submission?.properties.uploaded.by,
        submission?.properties.lastModified.by,
    ]);

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

    if (error !== undefined) {
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
                    {error}
                </Typography>
                <HomeButton sx={{ mt: 3 }} />
                <Footer />
            </>
        );
    }

    if (submission?._id !== id || uploader === undefined || lastModifier === undefined) {
        return (
            <>
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h2">Loading</Typography>
                <Typography variant="subtitle2" color="gray">
                    Fetching {uploader === undefined || lastModifier === undefined ? 'related users' : 'submission'}...
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
                <SingleSubmissionPage
                    loggedInUser={loggedInUser}
                    submission={submission}
                    setSubmission={setSubmission}
                    uploader={uploader}
                    lastModifier={lastModifier}
                />
                <Footer />
            </Page>
        </>
    );
};

export default SingleSubmissionPageWrapper;
