import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginButton } from '../../components/Buttons';
import { InternalLink } from '../../components/Links';
import { SettingsContext, UserSessionContext } from '../../contexts';
import { LoginPageContainer } from './LoginPage.styled';

enum AuthStage {
    /** Requesting an access token from AIMS. */
    Loading,

    /** State in settings context !== state in URL. */
    CSRF,

    /** Non-200 response received from AIMS, or invalid URL parameters. */
    Errored,

    /** Login response retrieved successfully, redirecting to home page. */
    Exiting,
}

const LoginPage = () => {
    const [searchParams] = useSearchParams();

    const [authStage, setAuthStage] = useState<AuthStage>(AuthStage.Loading);
    const [error, setError] = useState<string>('');

    const {
        sessionData: { state: localState },
    } = useContext(SettingsContext);

    const { controllers: userControllers } = useContext(UserSessionContext);

    useEffect(() => {
        if (authStage !== AuthStage.Loading) return;

        const code = searchParams.get('code');
        const receivedState = searchParams.get('state');

        if (code === null) {
            setAuthStage(AuthStage.Errored);
            setError(
                'Code is missing from the URL, you should be redirected to this page after trying to log in with Discord.\nPlease do not try to access this page directly.',
            );
            return;
        }

        if (receivedState === null) {
            setAuthStage(AuthStage.Errored);
            setError(
                'State is missing from the URL, you should be redirected to this page after trying to log in with Discord.\nPlease do not try to access this page directly.',
            );
            return;
        }

        if (receivedState !== localState) {
            setAuthStage(AuthStage.CSRF);
            return;
        }

        const controller = new AbortController();

        userControllers.requestLogin(code, controller).then((res) => {
            if (res === 'canceled') {
                setError('Login Cancelled');
                setAuthStage(AuthStage.Errored);
            } else if (res.success) {
                // successfully logged in
                setAuthStage(AuthStage.Exiting);
                window.open('/', '_self');
            } else if (res.generic) {
                setError(`Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`);
                setAuthStage(AuthStage.Errored);
            } else if (res.status === 429) {
                setError(`Rate limited, try again in ${res.data.reset} seconds`);
                setAuthStage(AuthStage.Errored);
            } else if (res.status === 501) {
                setError('Logging in has been disabled');
                setAuthStage(AuthStage.Errored);
            } else {
                setError(`Error ${res.status}: ${res.data}`);
                setAuthStage(AuthStage.Errored);
            }
        });

        return () => {
            controller.abort();
        };
    }, [authStage, localState, searchParams, userControllers]);

    switch (authStage) {
        case AuthStage.Loading:
            return (
                <>
                    <Typography variant="h3">Loading</Typography>
                    <Typography color="gray" gutterBottom textAlign="center">
                        This shouldn't take too long...
                    </Typography>
                    <div style={{ width: 'min(60%, 400px)' }}>
                        <LinearProgress />
                    </div>
                </>
            );
        case AuthStage.CSRF:
            return (
                <LoginPageContainer maxWidth="md">
                    <Typography variant="h3" color="red">
                        CSRF
                    </Typography>
                    <Typography color="gray" gutterBottom textAlign="center">
                        Cross Site Request Forgery may have taken place, meaning your request was intercepted.
                        <br />
                        You can try to login again, but make sure it's safe to do so.
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <InternalLink to="/">
                            <Button variant="outlined" color="secondary" size="large">
                                Home
                            </Button>
                        </InternalLink>
                        <LoginButton size="large" />
                    </Stack>
                </LoginPageContainer>
            );
        case AuthStage.Errored:
            return (
                <LoginPageContainer maxWidth="md">
                    <Typography variant="h3">Error</Typography>
                    <Typography color="gray" gutterBottom textAlign="center">
                        {error}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <InternalLink to="/">
                            <Button variant="outlined" color="secondary" size="large">
                                Home
                            </Button>
                        </InternalLink>
                        <LoginButton size="large" />
                    </Stack>
                </LoginPageContainer>
            );
        case AuthStage.Exiting:
            return (
                <LoginPageContainer maxWidth="md">
                    <Typography variant="h3">Login Complete</Typography>
                    <Typography color="gray" gutterBottom textAlign="center">
                        Redirecting you to the homepage, adios!
                    </Typography>
                    <Fade in>
                        <img src="https://i.redd.it/m308pw9b09831.jpg" alt="adios" />
                    </Fade>
                </LoginPageContainer>
            );
    }
};

export default LoginPage;
