import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    Typography,
    Stack,
    Grid,
    Chip,
    Container,
    CircularProgress,
    Collapse,
    ListItemButton,
    Button,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { HomeButton } from '../../components/Buttons';
import { SettingsContext, UserSessionContext } from '../../contexts';
import Footer from '../../components/Footer';
import ProfilePicture from '../../components/ProfilePicture';
import {
    hasOneOfPermissions,
    hasPermission,
    permissionDescriptionsMap,
    permissionsDisplayOrder,
    splitBitField,
} from '../../helpers';
import { useParams } from 'react-router-dom';
import { ExpandMore, UserBadges } from '../../components/Icons';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs';
import { getUser } from '../../api/aims';
import { ClientFacingUser, UserPermissions, User } from '../../types';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import PermissionEditor from '../../components/PermissionEditor/PermissionEditor';

import eyes from './eyes.png';
import { messages } from '../../constants';

dayjs.extend(relativeTime);

export interface ProfilePageProps {
    user: ClientFacingUser;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
    const { user: loggedInUser, controllers } = useContext(UserSessionContext);
    const { settings } = useContext(SettingsContext);
    const permissions = useMemo(
        () =>
            splitBitField(user.permissions).sort(
                (a, b) => permissionsDisplayOrder.indexOf(a) - permissionsDisplayOrder.indexOf(b),
            ),
        [user.permissions],
    );

    const isSelf = useMemo(() => loggedInUser?.userData._id === user._id, [loggedInUser?.userData._id, user._id]);

    const canViewIp = useMemo(() => {
        return loggedInUser !== null && (isSelf || hasPermission(loggedInUser.userData, UserPermissions.Owner));
    }, [isSelf, loggedInUser]);

    const [permissionElementOpen, setPermissionElementOpen] = useState(false);

    const permissionElement = useMemo(() => {
        if (loggedInUser === null) return <></>;
        if (!hasOneOfPermissions(loggedInUser.userData, UserPermissions.Owner, UserPermissions.AssignPermissions)) {
            return <></>;
        }

        if (
            hasPermission(user, UserPermissions.Owner) &&
            !hasPermission(loggedInUser.userData, UserPermissions.Owner)
        ) {
            return <></>;
        }

        return (
            <>
                <Button
                    variant="outlined"
                    color="info"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                        e.preventDefault();
                        setPermissionElementOpen(true);
                    }}
                >
                    Edit Permissions
                </Button>
                <PermissionEditor
                    loggedInUser={loggedInUser}
                    open={permissionElementOpen}
                    onClose={() => {
                        setPermissionElementOpen(false);
                    }}
                    onPermissionsUpdate={(newPermissions) => {
                        user.permissions = newPermissions;
                        if (isSelf) {
                            controllers.updatePermissions(newPermissions);
                        }
                    }}
                    targetUser={user}
                />
            </>
        );
    }, [controllers, isSelf, loggedInUser, permissionElementOpen, user]);

    const submissionElement = useMemo(() => {
        if (loggedInUser === null || !isSelf) return <></>;

        if (
            !hasOneOfPermissions(
                loggedInUser.userData,
                UserPermissions.Owner,
                UserPermissions.AssignPermissions,
                UserPermissions.Upload,
            )
        ) {
            return <></>;
        }
        return (
            <>
                <Button
                    variant="outlined"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    New Submission
                </Button>
            </>
        );
    }, [isSelf, loggedInUser]);

    const [isViewingPermissions, setIsViewingPermissions] = useState(false);

    const [isRevealingIp, setIsRevealingIp] = useState(false);

    const [logoutResponse, setLogoutResponse] = useState('');

    const [numTimesPermissionsOpened, setNumTimesPermissionsOpened] = useState(0);

    const handleLogout = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (loggedInUser === null) return;

            controllers
                .requestLogout({
                    baseURL: settings.serverUrl,
                    siteToken: loggedInUser.siteToken,
                    rateLimitBypassToken: settings.rateLimitBypassToken,
                })
                .then((res) => {
                    if (res === 'aborted') setLogoutResponse(messages.aborted);
                    else if (res.success) setLogoutResponse('Logout Successful');
                    else if (res.generic) setLogoutResponse(messages.genericFail(res));
                    else if (res.status === 401) setLogoutResponse(messages[401](res.data));
                    else if (res.status === 429) setLogoutResponse(messages[429](res.data));
                    else throw res;
                });
        },
        [controllers, loggedInUser, settings.rateLimitBypassToken, settings.serverUrl],
    );

    return (
        <>
            <SiteBreadcrumbs
                items={[
                    { to: '/', text: 'Home' },
                    { to: '/users', text: 'Users' },
                    { to: `/users/${user._id}`, text: user.username },
                ]}
            />
            <Container maxWidth="xs" sx={{ mt: 3 }}>
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <div style={{ flexGrow: 1 }} />
                        <ProfilePicture user={user} isSelf />
                        <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.username}#{user.discriminator}
                            <br />
                            <span style={{ color: 'gray' }}>{user._id}</span>
                        </Typography>
                        <div style={{ flexGrow: 1 }} />
                        <Typography
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                            title="Number of public posts."
                        >
                            {user.posts}&nbsp;
                            <ImageIcon />
                        </Typography>
                    </Stack>

                    <UserBadges user={user} />

                    <Typography title={new Date(user.registered).toUTCString()} textAlign="center">
                        Registered {dayjs(user.registered).fromNow()}.{' '}
                        <span style={{ color: 'gray' }}>({new Date(user.registered).toLocaleDateString('en-NZ')})</span>
                    </Typography>

                    <Typography title={new Date(user.lastLoginOrRefresh).toUTCString()} textAlign="center">
                        Last seen {dayjs(user.lastLoginOrRefresh).fromNow()}.{' '}
                        <span style={{ color: 'gray' }}>
                            ({new Date(user.lastLoginOrRefresh).toLocaleDateString('en-NZ')})
                        </span>
                    </Typography>

                    {canViewIp && (
                        <Typography textAlign="center">
                            IP:{' '}
                            <span style={{ minWidth: '100px' }}>
                                {isRevealingIp ? user.latestIp ?? 'Unknown' : 'Hidden'}
                            </span>
                            <Button
                                variant="text"
                                color="secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsRevealingIp(!isRevealingIp);
                                }}
                            >
                                {isRevealingIp ? 'Hide' : 'Reveal'}
                            </Button>
                        </Typography>
                    )}

                    {permissions.length !== 0 && (
                        <>
                            <ListItemButton
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsViewingPermissions(!isViewingPermissions);
                                    setNumTimesPermissionsOpened(numTimesPermissionsOpened + 1);
                                }}
                            >
                                {isViewingPermissions ? 'Hide' : 'View'} Permissions ({permissions.length})
                                <ExpandMore disableRipple expand={isViewingPermissions}>
                                    <ExpandMoreIcon />
                                </ExpandMore>
                            </ListItemButton>
                            <Collapse in={isViewingPermissions}>
                                <Grid container spacing={1} sx={{ p: 1 }}>
                                    {numTimesPermissionsOpened > 10 && (
                                        <Grid item>
                                            <img
                                                loading="lazy"
                                                src={eyes}
                                                alt="close up of my eyes"
                                                style={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {permissions.map((permission) => (
                                        <Grid item key={permission}>
                                            <Chip
                                                title={permissionDescriptionsMap[permission]}
                                                label={UserPermissions[permission]}
                                                component="span"
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Collapse>
                        </>
                    )}

                    {isSelf && !true && (
                        <>
                            <ListItemButton
                                onClick={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                Submissions
                                <ExpandMore disableRipple expand={false}>
                                    <ExpandMoreIcon />
                                </ExpandMore>
                            </ListItemButton>
                        </>
                    )}

                    {permissionElement}

                    {submissionElement}

                    {isSelf && (
                        <Button variant="outlined" color="warning" startIcon={<LogoutIcon />} onClick={handleLogout}>
                            Logout
                        </Button>
                    )}

                    {logoutResponse !== '' && (
                        <Typography color="gray" textAlign="center" gutterBottom>
                            {logoutResponse}
                        </Typography>
                    )}

                    <HomeButton sx={{ width: '100%' }} size="medium" />
                </Stack>
            </Container>
        </>
    );
};

const ProfilePageWrapper = () => {
    const { user: loggedInUser } = useContext(UserSessionContext);
    const { settings } = useContext(SettingsContext);
    const { id } = useParams();

    const [queriedUser, setQueriedUser] = useState<ClientFacingUser | User | null>(
        id !== undefined && id === loggedInUser?.userData._id ? loggedInUser.userData : null,
    );

    const [error, setError] = useState<string>();

    useEffect(() => {
        if (loggedInUser === null) return;
        if (queriedUser?._id !== loggedInUser?.userData._id) return;

        setQueriedUser({ ...loggedInUser?.userData });
    }, [loggedInUser, queriedUser?._id]);

    useEffect(() => {
        if (id === undefined || (queriedUser !== null && queriedUser._id === id)) return;

        const controller = new AbortController();

        getUser(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser?.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            id,
        ).then((res) => {
            if (res === 'aborted') setError(messages.aborted);
            else if (res.success) {
                setError(undefined);
                setQueriedUser(res.data);
            } else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 401) setError(messages[401](res.data));
            else if (res.status === 404) setError('User Not Found');
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
        loggedInUser?.userData,
        queriedUser,
        settings.rateLimitBypassToken,
        settings.serverUrl,
    ]);

    if (id === undefined) {
        return (
            <>
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

    if (error !== undefined) {
        return (
            <>
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

    if (queriedUser === null) {
        return (
            <>
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h2">Loading</Typography>
                <Typography variant="subtitle2" color="gray">
                    Fetching profile data...
                </Typography>
                <CircularProgress size={60} sx={{ mt: 3 }} />
                <Footer />
            </>
        );
    }

    return (
        <>
            <ProfilePage user={queriedUser} />
            <Footer />
        </>
    );
};

export default ProfilePageWrapper;
