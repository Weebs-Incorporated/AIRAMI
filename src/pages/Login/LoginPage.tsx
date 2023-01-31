import { useContext, useEffect, useState } from 'react';
import { Fade, LinearProgress, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { HomeButton, LoginButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import { SettingsContext, UserSessionContext } from '../../contexts';
import { LoginPageContainer } from './LoginPage.styled';
import { messages } from '../../constants';

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
            if (res === 'aborted') {
                setError(messages.aborted);
                setAuthStage(AuthStage.Errored);
            } else if (res.success) {
                // successfully logged in
                setError('');
                setAuthStage(AuthStage.Exiting);
                window.open('/', '_self');
            } else if (res.generic) {
                setError(messages.genericFail(res));
                setAuthStage(AuthStage.Errored);
            } else if (res.status === 403) {
                setError('Invalid Code or Redirect URI (403)');
            } else if (res.status === 429) {
                setError(messages[429](res.data));
                setAuthStage(AuthStage.Errored);
            } else if (res.status === 500) {
                setError(messages[500](res.data));
            } else if (res.status === 501) {
                setError(messages[501]);
                setAuthStage(AuthStage.Errored);
            } else throw res;
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
                        <HomeButton />
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
                        <HomeButton />
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

const LoginPageWrapper = () => (
    <>
        <div style={{ flexGrow: 1 }} />
        <LoginPage />
        <Footer />
    </>
);

export default LoginPageWrapper;
