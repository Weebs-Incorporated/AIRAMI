import {
    Button,
    Collapse,
    Fade,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { aims } from '../../api';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs/SiteBreadcrumbs';
import { SettingsContext, UserSession, UserSessionContext } from '../../contexts';
import { hasOneOfPermissions, hasPermission } from '../../helpers';
import UserRow from './UserRow';
import { messages } from '../../constants';
import { ClientFacingUser, UserPermissions } from '../../types';
import { Page } from '../Page.styled';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface UsersPageProps {
    loggedInUser: UserSession;
}

const UsersPage = ({ loggedInUser }: UsersPageProps) => {
    const { settings } = useContext(SettingsContext);
    const { controllers: userControllers } = useContext(UserSessionContext);

    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [totalUserCount, setTotalUserCount] = useState(0);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<ClientFacingUser[]>();
    const [isRevealingIps, setIsRevealingIps] = useState(false);

    const canShowIps = useMemo(
        () => hasPermission(loggedInUser.userData, UserPermissions.Owner),
        [loggedInUser.userData],
    );

    const fetchAllUsers = useCallback(
        (controller?: AbortController) => {
            aims.getAllUsers(
                {
                    baseURL: settings.serverUrl,
                    siteToken: loggedInUser.siteToken,
                    controller,
                    rateLimitBypassToken: settings.rateLimitBypassToken,
                },
                page,
                perPage,
            ).then((res) => {
                if (res === 'aborted') setError(messages.aborted);
                else if (res.success) {
                    setUsers(res.data.users);
                    setTotalUserCount(res.data.totalItems);
                    setError('');
                } else if (res.generic) setError(messages.genericFail(res));
                else if (res.status === 401) setError(messages[401](res.data));
                else if (res.status === 403) setError(messages[403]());
                else if (res.status === 429) setError(messages[429](res.data));
                else if (res.status === 501) setError(messages[501]);
                else throw res;
            });
        },
        [loggedInUser.siteToken, page, perPage, settings.rateLimitBypassToken, settings.serverUrl],
    );

    useEffect(() => {
        const controller = new AbortController();

        fetchAllUsers(controller);

        return () => {
            controller.abort();
        };
    }, [fetchAllUsers]);

    const paginationElement = useMemo(
        () => (
            <Fade in={users !== undefined}>
                <TablePagination
                    component="div"
                    sx={{ alignSelf: 'flex-start' }}
                    labelRowsPerPage="Users per page"
                    rowsPerPageOptions={[20, 50, 100]}
                    count={totalUserCount}
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
            </Fade>
        ),
        [page, perPage, totalUserCount, users],
    );

    return (
        <>
            <Collapse in={error !== ''}>
                <Typography color="lightcoral">{error}</Typography>
            </Collapse>

            <Stack direction="row" alignSelf="flex-end" spacing={1}>
                <Button
                    variant="outlined"
                    onClick={(e) => {
                        e.preventDefault();
                        setUsers(undefined);
                        fetchAllUsers();
                    }}
                    disabled={users === undefined}
                    startIcon={<RefreshIcon />}
                >
                    Refresh
                </Button>
                {canShowIps && (
                    <Fade in={users !== undefined}>
                        <Button
                            variant="outlined"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsRevealingIps(!isRevealingIps);
                            }}
                            startIcon={isRevealingIps ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        >
                            {isRevealingIps ? 'Hide' : 'Reveal'} IPs
                        </Button>
                    </Fade>
                )}
            </Stack>

            {paginationElement}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Posts</TableCell>
                            {isRevealingIps && <TableCell>IP</TableCell>}
                            <TableCell>Permissions</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell>Last Seen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users === undefined ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <LinearProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {users.map((e) => (
                                    <UserRow
                                        key={e._id}
                                        user={e}
                                        showIp={isRevealingIps}
                                        loggedInUser={loggedInUser}
                                        onPermissionUpdate={(newPermissions, isSelf) => {
                                            const userIndex = users.indexOf(e);
                                            users[userIndex] = { ...users[userIndex], permissions: newPermissions };

                                            setUsers([...users]);
                                            if (isSelf) {
                                                userControllers.updatePermissions(newPermissions);
                                            }
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {paginationElement}
        </>
    );
};

const UsersPageWrapper = () => {
    const { user } = useContext(UserSessionContext);

    if (
        user === null ||
        !hasOneOfPermissions(user.userData, UserPermissions.Owner, UserPermissions.AssignPermissions)
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
                    { to: '/users', text: 'Users' },
                ]}
            />
            <Page maxWidth="xl">
                <UsersPage loggedInUser={user} />
                <Footer />
            </Page>
        </>
    );
};

export default UsersPageWrapper;
