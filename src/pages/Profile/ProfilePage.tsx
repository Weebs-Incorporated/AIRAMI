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
import { hasOneOfPermissions, hasPermission, permissionDescriptionsMap, permissionsToString } from '../../helpers';
import { AIMS } from '../../types';
import { useParams } from 'react-router-dom';
import { aims } from '../../api';
import { ExpandMore, UserBadges } from '../../components/Icons';
import SiteBreadcrumbs from '../../components/SiteBreadcrumbs/SiteBreadcrumbs';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import GavelIcon from '@mui/icons-material/Gavel';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ImageIcon from '@mui/icons-material/Image';
import CreateIcon from '@mui/icons-material/Create';

dayjs.extend(relativeTime);

export interface ProfilePageProps {
    user: AIMS.ClientFacingUser | AIMS.User;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
    const { user: loggedInUser, controllers } = useContext(UserSessionContext);
    const permissions = useMemo(() => permissionsToString(user.permissions), [user.permissions]);

    const isSelf = useMemo(() => loggedInUser?.userData._id === user._id, [loggedInUser?.userData._id, user._id]);

    const canViewIp = useMemo(() => {
        return loggedInUser !== null && (isSelf || hasPermission(loggedInUser.userData, AIMS.UserPermissions.Owner));
    }, [isSelf, loggedInUser]);

    const canModifyPermissions = useMemo(() => {
        return (
            loggedInUser !== null &&
            hasOneOfPermissions(
                loggedInUser.userData,
                AIMS.UserPermissions.Owner,
                AIMS.UserPermissions.AssignPermissions,
            )
        );
    }, [loggedInUser]);

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
                    setLogoutResponse(`Error ${res.status}${res.statusText !== '' ? ` ${res.statusText}` : ''}`);
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
                            <Typography sx={{ display: 'flex', alignItems: 'center' }} title="Number of public posts.">
                                <ImageIcon />
                                &nbsp;{user.posts}
                            </Typography>
                            <Typography sx={{ display: 'flex', alignItems: 'center' }} title="Number of comments.">
                                <ChatBubbleIcon />
                                &nbsp;{user.comments}
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
                                }}
                            >
                                {isViewingPermissions ? 'Hide' : 'View'} Permissions ({permissions.length})
                                <ExpandMore disableRipple expand={isViewingPermissions}>
                                    <ExpandMoreIcon />
                                </ExpandMore>
                            </ListItemButton>
                            <Collapse in={isViewingPermissions}>
                                <Grid container spacing={1} sx={{ p: 1 }}>
                                    {permissions.map((permission) => (
                                        <Grid item key={permission[0]}>
                                            <Chip
                                                title={permissionDescriptionsMap[permission[0]]}
                                                label={permission[0]}
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
                            <Collapse in={false}>
                                <Grid container spacing={1} sx={{ p: 1 }}>
                                    {permissions.map((permission) => (
                                        <Grid item key={permission[0]}>
                                            <Chip
                                                title={permissionDescriptionsMap[permission[0]]}
                                                label={permission[0]}
                                                component="span"
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Collapse>
                        </>
                    )}

                    {canModifyPermissions && (
                        <Button variant="outlined" color="info" startIcon={<GavelIcon />}>
                            Edit Permissions
                        </Button>
                    )}

                    {canMakeSubmission && (
                        <Button variant="outlined" color="success" startIcon={<CreateIcon />}>
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
                setError(`Error ${res.status}${res.statusText !== '' ? ` ${res.statusText}` : ''}`);
                return;
            }

            if (res.status === 401) {
                setError('Invalid log in credentials, logging out is recommended.');
                return;
            }

            if (res.status === 404) {
                setError('User not found.');
                return;
            }

            setError(`Rate limited, try again in ${res.data.reset} seconds.`);
            return;
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
