import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Container, Card, Typography, Stack, Button, Collapse, LinearProgress } from '@mui/material';
import { SettingsContext, UserSession, UserSessionContext, UserSessionControllers } from '../../contexts';
import { LoginButton } from '../../components/Buttons';
import { messages } from '../../constants';
import RelativeTimeString from '../../components/RelativeTimeString';

export interface SettingsSessionDataProps {
    user: UserSession;
    controllers: UserSessionControllers;
}

const SettingsSessionData = ({ user, controllers }: SettingsSessionDataProps) => {
    const { settings } = useContext(SettingsContext);

    const expiryTimestamp = useMemo<number>(
        () => (user === null ? 0 : new Date(user.setAt).getTime() + 1000 * user.expiresInSeconds),
        [user],
    );

    const [lastOutput, setLastOutput] = useState('');

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleLogout = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (user?.siteToken === undefined) return;

            setLastOutput('');
            setIsLoggingOut(true);

            controllers
                .requestLogout({
                    baseURL: settings.serverUrl,
                    siteToken: user.siteToken,
                    rateLimitBypassToken: settings.rateLimitBypassToken,
                })
                .then((res) => {
                    if (res === 'aborted') setLastOutput(messages.aborted);
                    else if (res.success) setLastOutput('Logout successful');
                    else if (res.generic) setLastOutput(messages.genericFail(res));
                    else if (res.status === 401) setLastOutput(messages[401](res.data));
                    else if (res.status === 429) setLastOutput(messages[429](res.data));
                    else throw res;
                })
                .finally(() => setIsLoggingOut(false));
        },
        [controllers, settings.rateLimitBypassToken, settings.serverUrl, user?.siteToken],
    );

    const handleRefresh = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (user?.siteToken === undefined) return;

            setLastOutput('');
            setIsRefreshing(true);

            controllers
                .requestRefresh(
                    {
                        baseURL: settings.serverUrl,
                        siteToken: user.siteToken,
                        rateLimitBypassToken: settings.rateLimitBypassToken,
                    },
                    user.firstSetAt,
                )
                .then((res) => {
                    if (res === 'aborted') setLastOutput(messages.aborted);
                    else if (res.success) setLastOutput('Refresh Successful');
                    else if (res.generic) setLastOutput(messages.genericFail(res));
                    else if (res.status === 401) setLastOutput(messages[401](res.data));
                    else if (res.status === 403) setLastOutput('Expired or Invalid Refresh Token (403)');
                    else if (res.status === 429) setLastOutput(messages[429](res.data));
                    else if (res.status === 500) setLastOutput(messages[500](res.data));
                    else if (res.status === 501) setLastOutput(messages[501]);
                    else throw res;
                })
                .finally(() => setIsRefreshing(false));
        },
        [controllers, settings.rateLimitBypassToken, settings.serverUrl, user?.firstSetAt, user?.siteToken],
    );

    return (
        <Container sx={{ mt: 3 }} maxWidth="sm">
            <Card sx={{ p: 1 }} elevation={10}>
                <Stack sx={{ width: '100%' }} alignItems="flex-start">
                    <Typography variant="h4" textAlign="center" gutterBottom>
                        Session Data
                    </Typography>

                    <Typography title={`Discord ID: ${user.userData._id}`}>
                        User: {user.userData.username}#{user.userData.discriminator}
                    </Typography>
                    <Typography title={new Date(user.setAt).toUTCString()}>
                        Last Updated: {new Date(user.setAt).toLocaleDateString('en-NZ')}{' '}
                        <RelativeTimeString time={user.setAt} inBrackets />
                    </Typography>
                    <Typography title={new Date(user.firstSetAt).toUTCString()}>
                        Since: {new Date(user.firstSetAt).toLocaleDateString('en-NZ')}{' '}
                        <RelativeTimeString time={user.firstSetAt} inBrackets />
                    </Typography>
                    <Typography title={new Date(expiryTimestamp).toLocaleDateString('en-NZ')}>
                        Expires <RelativeTimeString time={expiryTimestamp} /> (
                        {new Date(expiryTimestamp).toLocaleDateString('en-NZ')})
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignSelf="flex-end">
                        <Button
                            variant="outlined"
                            color="info"
                            onClick={handleRefresh}
                            disabled={isLoggingOut || isRefreshing}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleLogout}
                            disabled={isLoggingOut || isRefreshing}
                        >
                            Logout
                        </Button>
                    </Stack>

                    <Collapse in={isLoggingOut || isRefreshing} sx={{ alignSelf: 'stretch' }}>
                        <Stack sx={{ mt: 1 }}>
                            <Typography color="gray" gutterBottom textAlign="center">
                                {isLoggingOut ? 'Logging Out' : 'Refreshing'}
                            </Typography>
                            <LinearProgress />
                        </Stack>
                    </Collapse>
                    <Collapse in={lastOutput !== ''} sx={{ alignSelf: 'center' }}>
                        <Typography color="gray" sx={{ mt: 1 }}>
                            {lastOutput}
                        </Typography>
                    </Collapse>
                </Stack>
            </Card>
        </Container>
    );
};

const SettingsSessionDataWrapper = () => {
    const { user, controllers } = useContext(UserSessionContext);

    if (user === null) return <LoginButton size="large" />;

    return <SettingsSessionData user={user} controllers={controllers} />;
};

export default SettingsSessionDataWrapper;
