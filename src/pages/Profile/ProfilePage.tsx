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
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';
import { hasOneOfPermissions, hasPermission, permissionDescriptionsMap, splitPermissionsField } from '../../helpers';
import { AIMS } from '../../types';
import { useParams } from 'react-router-dom';
import { aims } from '../../api';
import { ExpandMore, UserBadges } from '../../components/Icons';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs/SiteBreadcrumbs';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import PermissionEditor from '../../components/PermissionEditor/PermissionEditor';

import eyes from './eyes.png';

dayjs.extend(relativeTime);

export interface ProfilePageProps {
    user: AIMS.ClientFacingUser;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
    const { user: loggedInUser, controllers } = useContext(UserSessionContext);
    const permissions = useMemo(() => splitPermissionsField(user.permissions), [user.permissions]);

    const isSelf = useMemo(() => loggedInUser?.userData._id === user._id, [loggedInUser?.userData._id, user._id]);

    const canViewIp = useMemo(() => {
        return loggedInUser !== null && (isSelf || hasPermission(loggedInUser.userData, AIMS.UserPermissions.Owner));
    }, [isSelf, loggedInUser]);

    const [permissionElementOpen, setPermissionElementOpen] = useState(false);

    const permissionElement = useMemo(() => {
        if (loggedInUser === null) return <></>;
        if (
            !hasOneOfPermissions(
                loggedInUser.userData,
                AIMS.UserPermissions.Owner,
                AIMS.UserPermissions.AssignPermissions,
            )
        ) {
            return <></>;
        }

        if (
            hasPermission(user, AIMS.UserPermissions.Owner) &&
            !hasPermission(loggedInUser.userData, AIMS.UserPermissions.Owner)
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

    const canMakeSubmission = useMemo(() => {
        return (
            loggedInUser?.userData._id === user._id &&
            hasOneOfPermissions(
                loggedInUser.userData,
                AIMS.UserPermissions.AssignPermissions,
                AIMS.UserPermissions.Owner,
                AIMS.UserPermissions.Upload,
            )
        );
    }, [loggedInUser, user._id]);

    const [isViewingPermissions, setIsViewingPermissions] = useState(false);

    const [isRevealingIp, setIsRevealingIp] = useState(false);

    const [logoutResponse, setLogoutResponse] = useState('');

    const [numTimesPermissionsOpened, setNumTimesPermissionsOpened] = useState(0);

    const handleLogout = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (loggedInUser === null) return;

            controllers.requestLogout(loggedInUser).then((res) => {
                if (res === 'canceled') {
                    setLogoutResponse('Logout cancelled');
                    return;
                }

                if (res.success || (!res.generic && res.status === 400)) {
                    setLogoutResponse('Logout successful');
                    return;
                }

                if (res.generic) {
                    setLogoutResponse(`Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`);
                    return;
                }

                if (res.status === 401) {
                    setLogoutResponse(`Error 401: ${res.data}`);
                    return;
                }

                setLogoutResponse(`Rate limited, try again in ${res.data.reset} seconds`);
            });
        },
        [controllers, loggedInUser],
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
                        <Stack justifySelf="flex-end">
                            <Typography
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                                title="Number of public posts."
                            >
                                {user.posts}&nbsp;
                                <ImageIcon />
                            </Typography>
                            <Typography
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                                title="Number of comments."
                            >
                                {user.comments}&nbsp;
                                <ChatBubbleIcon />
                            </Typography>
                        </Stack>
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
                                                label={AIMS.UserPermissions[permission]}
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

                    {canMakeSubmission && (
                        <Button variant="outlined" color="success" startIcon={<AddIcon />}>
                            New Submission
                        </Button>
                    )}

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

    const [queriedUser, setQueriedUser] = useState<AIMS.ClientFacingUser | AIMS.User | null>(
        id !== undefined && id === loggedInUser?.userData._id ? loggedInUser.userData : null,
    );

    const [error, setError] = useState<string>();

    useEffect(() => {
        if (id === undefined || (queriedUser !== null && queriedUser._id === id)) return;

        const controller = new AbortController();

        aims.getUser(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser?.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            id,
        ).then((res) => {
            if (res === 'canceled') {
                setError('Profile data fetching was aborted.');
                return;
            }
            if (res.success) {
                setError(undefined);
                setQueriedUser(res.data);
                return;
            }

            if (res.generic) {
                setError(`Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`);
                return;
            }

            if (res.status === 401) {
                setError('Invalid credentials, logging out is recommended.');
                return;
            }

            if (res.status === 404) {
                setError('User not found.');
                return;
            }

            if (res.status === 429) {
                setError(`Rate limited, try again in ${res.data.reset} seconds.`);
                return;
            }

            if (res.status === 501) {
                setError('User database not enabled.');
                return;
            }

            throw res;
        });

        return () => {
            controller.abort();
        };
    }, [id, loggedInUser?.siteToken, queriedUser, settings.rateLimitBypassToken, settings.serverUrl]);

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
