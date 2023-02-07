import { useContext, useEffect, useState } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { aims } from '../../api';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs';
import { messages } from '../../constants';
import { SettingsContext } from '../../contexts';
import { Post, PostStatus } from '../../types';
import { Page } from '../Page.styled';

import SinglePost from '../../components/SinglePost';

import { useActionState } from '../../hooks';

const SinglePostPage = () => {
    const { settings } = useContext(SettingsContext);
    const { id } = useParams();

    const [post, setPost] = useState<Post<PostStatus.Public>>();

    const { status, output, setSuccess, setError, setIdle, setInProgress } = useActionState();

    useEffect(() => {
        // don't try fetching the submission if not desired
        if (status !== 'inProgress') return;

        // don't try fetching the submission if no ID is specified
        if (id === undefined) return;

        // don't try fetching the submissison if we've already fetched it
        if (post?._id === id) return;

        const controller = new AbortController();

        aims.getPost(
            {
                baseURL: settings.serverUrl,
                siteToken: undefined,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            id,
        ).then((res) => {
            if (res === 'aborted') setIdle();
            else if (res.success) {
                setSuccess();
                setPost(res.data);
            } else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 404) setError('Post Not Found');
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });

        return () => {
            controller.abort();
        };
    }, [id, post?._id, setError, setIdle, setSuccess, settings.rateLimitBypassToken, settings.serverUrl, status]);

    useEffect(() => {
        setInProgress();
    }, [setInProgress]);

    if (id === undefined) {
        return (
            <>
                <SiteBreadcrumbs
                    items={[
                        { to: '/', text: 'Home' },
                        { to: '/posts', text: 'Posts' },
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

    if (status === 'errored') {
        return (
            <>
                <SiteBreadcrumbs
                    items={[
                        { to: '/', text: 'Home' },
                        { to: '/posts', text: 'Posts' },
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

    if (post?._id !== id) {
        return (
            <>
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h2">Loading</Typography>
                <Typography variant="subtitle2" color="gray">
                    Fetching Post...
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
                    { to: '/posts', text: 'Posts' },
                ]}
            />
            <Page maxWidth="xl">
                <SinglePost post={post} onUpdate={setPost} />
                <Footer />
            </Page>
        </>
    );
};

export default SinglePostPage;
