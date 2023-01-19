import { useContext, useEffect, useMemo, useState } from 'react';
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
import { SettingsContext, UserSessionContext, UserSessionControllers } from '../../contexts';
import Footer from '../../components/Footer';
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';
import { hasPermission, permissionDescriptionsMap, permissionsToString } from '../../helpers';
import { AIMS } from '../../types';
import { useParams } from 'react-router-dom';
import { aims } from '../../api';
import { ExpandMore, UserBadges } from '../../components/Icons';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

dayjs.extend(relativeTime);

export interface ProfilePageProps {
    user: AIMS.ClientFacingUser | AIMS.User;
    controllers?: UserSessionControllers | undefined;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
    const { user: loggedInUser } = useContext(UserSessionContext);
    const permissions = useMemo(() => permissionsToString(user.permissions), [user.permissions]);

    const canViewIp = useMemo(
        () =>
            loggedInUser !== null &&
            (loggedInUser.userData._id === user._id ||
                hasPermission(loggedInUser.userData, AIMS.UserPermissions.Owner)),
        [loggedInUser, user._id],
    );

    const [isViewingPermissions, setIsViewingPermissions] = useState(false);

    const [isRevealingIp, setIsRevealingIp] = useState(false);

    return (
        <Container maxWidth="xs" sx={{ mt: 3 }}>
            <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <ProfilePicture user={user} isSelf />
                    <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.username}#{user.discriminator}
                        <br />
                        <span style={{ color: 'gray' }}>{user._id}</span>
                    </Typography>
                </Stack>
                <UserBadges user={user} sx={{ pt: 1 }} />
                <Typography title={new Date(user.registered).toUTCString()} textAlign="center">
                    Registered {dayjs(user.registered).fromNow()}{' '}
                    <span style={{ color: 'gray' }}>({new Date(user.registered).toLocaleDateString('en-NZ')})</span>
                </Typography>

                <Typography title={new Date(user.lastLoginOrRefresh).toUTCString()} textAlign="center">
                    Last seen {dayjs(user.lastLoginOrRefresh).fromNow()}{' '}
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
                                    <Grid item key={permission}>
                                        <Chip
                                            title={permissionDescriptionsMap[permission]}
                                            label={permission}
                                            component="span"
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Collapse>
                    </>
                )}
            </Stack>
        </Container>
    );
};

const ProfilePageWrapper = () => {
    const { user: loggedInUser, controllers } = useContext(UserSessionContext);
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

    if (id === undefined)
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
            <ProfilePage
                user={queriedUser}
                controllers={queriedUser._id === loggedInUser?.userData._id ? controllers : undefined}
            />
            <Footer />
        </>
    );
};

export default ProfilePageWrapper;
