import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Container, Card, Typography, Stack, Button, Collapse } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { UserSessionContext } from '../../contexts';
import { LoginButton } from '../../components/Buttons';
import { messages } from '../../constants';

dayjs.extend(relativeTime);

const SettingsSessionData = () => {
    const { user, controllers } = useContext(UserSessionContext);

    const expiryTimestamp = useMemo<number>(
        () => (user === null ? 0 : new Date(user.setAt).getTime() + 1000 * user.expiresInSeconds),
        [user],
    );

    const titles = useMemo(
        () => ({
            loggedIn: user === null ? '' : `Discord ID: ${user.userData._id}`,
            since: user === null ? '' : new Date(user.setAt).toUTCString(),
            first: user === null ? '' : new Date(user.firstSetAt).toUTCString(),
            expires: user === null ? '' : new Date(expiryTimestamp).toUTCString(),
        }),
        [expiryTimestamp, user],
    );

    const content = useMemo(
        () => ({
            loggedIn: user === null ? '' : `Logged in as: ${user.userData.username}#${user.userData.discriminator}`,
            since:
                user === null
                    ? ''
                    : `${new Date(user.setAt).toLocaleDateString('en-NZ')} (${dayjs(user.setAt).fromNow()})`,
            first:
                user === null
                    ? ''
                    : `${new Date(user.firstSetAt).toLocaleDateString('en-NZ')} (${dayjs(user.firstSetAt).fromNow()})`,
            expires: user === null ? '' : dayjs(expiryTimestamp).fromNow(),
        }),
        [expiryTimestamp, user],
    );

    const [lastOutput, setLastOutput] = useState('');

    const handleLogout = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (user === null) return;

            controllers.requestLogout(user).then((res) => {
                if (res === 'aborted') {
                    setLastOutput('Logout aborted');
                    return;
                }

                if (res.success || (!res.generic && res.status === 400)) {
                    setLastOutput('Logout successful');
                    return;
                }

                if (res.generic) {
                    setLastOutput(`Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`);
                    return;
                }

                if (res.status === 401) {
                    setLastOutput(`Error 401: ${res.data}`);
                    return;
                }

                if (res.status === 429) {
                    setLastOutput(`Rate limited, try again in ${res.data.reset} seconds`);
                    return;
                }

                throw res;
            });
        },
        [controllers, user],
    );

    const handleRefresh = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (user === null) return;

            controllers.requestRefresh(user).then((res) => {
                if (res === 'aborted') setLastOutput(messages.aborted);
                else if (res.success) setLastOutput('Refresh successful');
                else if (res.generic) setLastOutput(messages.genericFail(res));
                else if (res.status === 401) setLastOutput(messages[401](res.data));
                else if (res.status === 403) setLastOutput('Expired/Invalid Refresh Token (403)');
                else if (res.status === 429) setLastOutput(messages[429](res.data));
                else if (res.status === 500) setLastOutput(messages[500](res.data));
                else if (res.status === 501) setLastOutput(messages[501]);
                else throw res;
            });
        },
        [controllers, user],
    );

    return (
        <Container sx={{ mt: 3 }} maxWidth="sm">
            <Card sx={{ p: 1, width: '100%', display: 'flex', flexDirection: 'column' }} elevation={10}>
                <Typography variant="h4" textAlign="center">
                    Session Data
                </Typography>
                {user === null ? (
                    <Typography textAlign="center" color="gray">
                        Not logged in
                    </Typography>
                ) : (
                    <>
                        <Typography title={titles.loggedIn}>{content.loggedIn}</Typography>
                        <Typography title={titles.since}>Last Updated: {content.since}</Typography>
                        <Typography title={titles.first}>Since: {content.first}</Typography>
                        <Typography title={titles.expires}>Expires {content.expires}</Typography>
                    </>
                )}
                {user === null ? (
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }} justifyContent="center">
                        <LoginButton />
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }} justifyContent="flex-end">
                        <Button variant="outlined" color="info" onClick={handleRefresh}>
                            Refresh
                        </Button>
                        <Button variant="outlined" color="warning" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Stack>
                )}
                <Collapse in={lastOutput !== ''}>
                    <Typography color="gray">{lastOutput}</Typography>
                </Collapse>
            </Card>
        </Container>
    );
};

export default SettingsSessionData;
