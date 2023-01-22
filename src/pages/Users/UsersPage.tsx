import {
    Button,
    Collapse,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { aims } from '../../api';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs/SiteBreadcrumbs';
import { SettingsContext, UserSession, UserSessionContext } from '../../contexts';
import { hasOneOfPermissions, hasPermission } from '../../helpers';
import { AIMS } from '../../types';
import { Page } from '../Page.styled';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UserRow from './UserRow';
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
    const [users, setUsers] = useState<AIMS.ClientFacingUser[]>();
    const [isRevealingIps, setIsRevealingIps] = useState(false);

    const canShowIps = useMemo(
        () => hasPermission(loggedInUser.userData, AIMS.UserPermissions.Owner),
        [loggedInUser.userData],
    );

    useEffect(() => {
        const controller = new AbortController();

        aims.getUsers(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            { page, perPage },
            null,
        ).then((res) => {
            if (res === 'aborted') {
                setError('User fetching was aborted.');
            } else if (res.success) {
                setUsers(res.data.users);
                setTotalUserCount(res.data.pagination.itemCount);
                setError('');
            } else if (res.generic) {
                setError(`Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`);
            } else {
                switch (res.status) {
                    case 401:
                        setError(`Error 401: ${res.data}`);
                        break;
                    case 403:
                        setError('Missing permissions to fetch users.');
                        break;
                    case 404:
                        setError('Fetching failed, you account may have been deleted.');
                        break;
                    case 429:
                        setError(`Rate limited, try again in ${res.data.reset} seconds.`);
                        break;
                    case 501:
                        setError('User database is not enabled.');
                        break;
                    default:
                        throw res;
                }
            }
        });

        return () => {
            controller.abort();
        };
    }, [page, perPage, settings.rateLimitBypassToken, settings.serverUrl, loggedInUser.siteToken]);

    const paginationElement = useMemo(() => {
        if (users === undefined) return <></>;

        return (
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
        );
    }, [page, perPage, totalUserCount, users]);

    return (
        <>
            {error !== '' && (
                <Collapse in>
                    <Typography color="lightcoral">{error}</Typography>
                </Collapse>
            )}

            {canShowIps && (
                <Button
                    variant="outlined"
                    sx={{ justifySelf: 'flex-end', alignSelf: 'flex-end' }}
                    onClick={(e) => {
                        e.preventDefault();
                        setIsRevealingIps(!isRevealingIps);
                    }}
                    startIcon={isRevealingIps ? <VisibilityOffIcon /> : <VisibilityIcon />}
                >
                    {isRevealingIps ? 'Hide' : 'Reveal'} IPs
                </Button>
            )}

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
        !hasOneOfPermissions(user.userData, AIMS.UserPermissions.Owner, AIMS.UserPermissions.AssignPermissions)
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
