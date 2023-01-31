import { Collapse, Grid, LinearProgress, TablePagination, Typography } from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

export interface SubmissionsPageProps {
    loggedInUser: UserSession;
}

const SubmissionsPage = ({ loggedInUser }: SubmissionsPageProps) => {
    const { settings } = useContext(SettingsContext);

    const [searchParams, setSearchParams] = useSearchParams();

    const [page, setPage] = useState(parseInt(searchParams.get('page') ?? '0'));
    const [perPage, setPerPage] = useState(parseInt(searchParams.get('perPage') ?? '20'));
    const [totalSubmissionCount, setTotalSubmissionCount] = useState(0);
    const [error, setError] = useState('');
    const [submissions, setSubmissions] = useState<Post<PostStatus.InitialAwaitingValidation>[]>();
    const [users, setUsers] = useState<Record<string, ClientFacingUser>>({});

    useEffect(
        () => setSearchParams({ page: page.toString(), perPage: perPage.toString() }),
        [page, perPage, setSearchParams],
    );

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
    }, [loggedInUser.siteToken, page, perPage, settings.rateLimitBypassToken, settings.serverUrl]);

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
            if (res === 'aborted') setError(messages.aborted);
            else if (res.success) {
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
    }, [loggedInUser.siteToken, page, perPage, settings.rateLimitBypassToken, settings.serverUrl, submissions]);

    const paginationElement = useMemo(() => {
        if (submissions === undefined) return <></>;

        return (
            <TablePagination
                component="div"
                sx={{ alignSelf: 'flex-start' }}
                labelRowsPerPage="Submissions per page"
                rowsPerPageOptions={[20, 50, 100]}
                count={totalSubmissionCount}
                rowsPerPage={perPage}
                page={page}
                onPageChange={(e, newPage) => {
                    e?.preventDefault();
                    setPage(newPage);
                }}
                onRowsPerPageChange={(e) => {
                    e.preventDefault();
                    setPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />
        );
    }, [page, perPage, submissions, totalSubmissionCount]);

    return (
        <>
            {error !== '' && (
                <Collapse in>
                    <Typography color="lightcoral">{error}</Typography>
                </Collapse>
            )}

            {paginationElement}

            <Grid container spacing={1}>
                {submissions === undefined ? (
                    <Grid item xs={12}>
                        <LinearProgress />
                    </Grid>
                ) : (
                    <>
                        {submissions.map((e) => (
                            <SubmissionRow
                                key={e._id}
                                user={users[e.properties.uploaded.by] ?? e.properties.uploaded.by}
                                submission={e}
                            />
                        ))}
                    </>
                )}
            </Grid>
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
