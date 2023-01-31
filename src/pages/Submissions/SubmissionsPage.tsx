import {
    Collapse,
    Fade,
    ImageList,
    LinearProgress,
    Pagination,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { aims } from '../../api';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs/SiteBreadcrumbs';
import { messages } from '../../constants';
import { SettingsContext, UserSession, UserSessionContext } from '../../contexts';
import { hasOneOfPermissions } from '../../helpers';
import { ClientFacingUser, Post, PostStatus, UserPermissions } from '../../types/AIMS';
import { Page } from '../Page.styled';
import SubmissionRow from './SubmissionRow';

const perPage = 20;

export interface SubmissionsPageProps {
    loggedInUser: UserSession;
}

const SubmissionsPage = ({ loggedInUser }: SubmissionsPageProps) => {
    const { settings } = useContext(SettingsContext);

    const theme = useTheme();

    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));
    const isLarge = useMediaQuery(theme.breakpoints.down('lg'));
    const isExtraLarge = useMediaQuery(theme.breakpoints.down('xl'));

    const cols = useMemo(
        () => (isSmall ? 1 : isMedium ? 2 : isLarge ? 3 : isExtraLarge ? 4 : 5),
        [isSmall, isMedium, isLarge, isExtraLarge],
    );

    const [page, setPage] = useState(0);
    const [totalSubmissionCount, setTotalSubmissionCount] = useState((page + 1) * perPage);
    const [error, setError] = useState('');
    const [submissions, setSubmissions] = useState<Post<PostStatus.InitialAwaitingValidation>[]>();
    const [users, setUsers] = useState<Record<string, ClientFacingUser>>({});

    useEffect(() => {
        const controller = new AbortController();

        aims.getAllSubmissions(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            page,
            perPage,
        ).then((res) => {
            if (res === 'aborted') return;
            if (res.success) {
                setTotalSubmissionCount(res.data.totalItems);
                setSubmissions(res.data.submissions);
                setError('');
            } else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 401) setError(messages[401](res.data));
            else if (res.status === 403) setError(messages[403]());
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });

        return () => {
            controller.abort();
        };
    }, [loggedInUser.siteToken, page, settings.rateLimitBypassToken, settings.serverUrl]);

    useEffect(() => {
        if (submissions === undefined) return;

        const controller = new AbortController();

        aims.getSomeUsers(
            {
                baseURL: settings.serverUrl,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
                siteToken: undefined,
            },
            submissions.map((e) => e.properties.uploaded.by),
        ).then((res) => {
            if (res === 'aborted') return;
            if (res.success) {
                const newUsers = Object.assign({}, ...res.data.map((e) => ({ [e._id]: e })));
                setUsers(newUsers);
                setError('');
            } else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });

        return () => {
            controller.abort();
        };
    }, [loggedInUser.siteToken, page, settings.rateLimitBypassToken, settings.serverUrl, submissions]);

    const paginationElement = useMemo(
        () =>
            totalSubmissionCount === 0 && submissions !== undefined ? (
                <></>
            ) : (
                <Fade in={submissions !== undefined}>
                    <Pagination
                        count={Math.ceil(totalSubmissionCount / perPage)}
                        page={page + 1}
                        onChange={(_e, p) => setPage(p - 1)}
                        shape="rounded"
                        variant="outlined"
                        color="standard"
                        size={isSmall ? 'small' : 'large'}
                    />
                </Fade>
            ),
        [isSmall, page, submissions, totalSubmissionCount],
    );

    return (
        <>
            <Collapse in={error !== ''}>
                <Typography color="lightcoral">{error}</Typography>
            </Collapse>

            {submissions !== undefined && (
                <Typography variant="h4" gutterBottom>
                    {totalSubmissionCount} Submissions
                </Typography>
            )}

            {paginationElement}

            {submissions === undefined ? (
                <div style={{ width: '100%' }}>
                    <LinearProgress />
                </div>
            ) : (
                <ImageList variant="masonry" cols={cols} gap={8}>
                    {submissions.map((e) => (
                        <SubmissionRow
                            key={e._id}
                            user={users[e.properties.uploaded.by] ?? e.properties.uploaded.by}
                            submission={e}
                        />
                    ))}
                </ImageList>
            )}

            {totalSubmissionCount === 0 && <Typography color="lightgreen">pog pog pogu</Typography>}

            {paginationElement}
        </>
    );
};

const SubmissionsPageWrapper = () => {
    const { user } = useContext(UserSessionContext);

    if (
        user === null ||
        !hasOneOfPermissions(
            user.userData,
            UserPermissions.Owner,
            UserPermissions.AssignPermissions,
            UserPermissions.Audit,
        )
    ) {
        return (
            <>
                <SiteBreadcrumbs
                    items={[
                        { to: '/', text: 'Home' },
                        { to: '/users', text: 'Users' },
                    ]}
                />
                <Page>
                    <div style={{ flexGrow: 1 }} />
                    <Typography variant="h3" gutterBottom>
                        Not Cool Enough
                    </Typography>
                    <Typography color="gray" textAlign="center">
                        Regular users are not allowed to access this page.
                    </Typography>
                    <HomeButton sx={{ mt: 3 }} />
                    <Footer />
                </Page>
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
                <SubmissionsPage loggedInUser={user} />
                <Footer />
            </Page>
        </>
    );
};

export default SubmissionsPageWrapper;
