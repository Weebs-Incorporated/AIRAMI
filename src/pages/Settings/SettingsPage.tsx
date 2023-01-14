import { useCallback, useContext, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { aims } from '../../api';
import { InternalLink } from '../../components/Links';
import { defaultSettings, Settings, SettingsContext } from '../../contexts';
import SettingsItem, { SettingsItemTest, SettingsItemTestState } from './SettingsItem';
import { RateLimitedResponse } from '../../types/CommonResponses';
import SettingsCog from './SettingsCog';

type ChangeCallback<T extends keyof Settings> = (key: T) => (e: React.ChangeEvent<HTMLInputElement>) => void;

export const SettingsPage = () => {
    const { settings, controllers: settingsControllers } = useContext(SettingsContext);

    const handleTextChange = useCallback<
        ChangeCallback<'discordApplicationId' | 'rateLimitBypassToken' | 'redirectUri' | 'serverUrl'>
    >(
        (k) => {
            return (e) => {
                e.preventDefault();
                settingsControllers.setValue(k, e.target.value);
            };
        },
        [settingsControllers],
    );

    const handleNumberChange = useCallback<ChangeCallback<'maxRefreshMinutes' | 'minRefreshSeconds'>>(
        (k) => {
            return (e) => {
                e.preventDefault();
                const val = Number(e.target.value);
                if (!Number.isNaN(val) && Number.isInteger(val)) {
                    settingsControllers.setValue(k, val);
                }
            };
        },
        [settingsControllers],
    );

    const handleReset = useCallback(
        (k: keyof Settings) => {
            return (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                settingsControllers.resetValue(k);
            };
        },
        [settingsControllers],
    );

    const [testApiUrlTitles, setTestApiUrlTitles] = useState<SettingsItemTest['title']>({
        available: 'Click to test URL',
        fail: 'Unknown error occurred',
        success: 'Received expected response',
        inProgress: 'Testing this URL...',
    });
    const [testApiUrlState, setTestApiUrlState] = useState<SettingsItemTestState>('available');

    const [testRateLimitTitles, setTestRateLimitTitles] = useState<SettingsItemTest['title']>({
        available: 'Click to test token',
        fail: 'Unknown error occurred',
        success: 'Token is valid',
        inProgress: 'Testing this token...',
    });
    const [testRateLimitState, setTestRateLimitState] = useState<SettingsItemTestState>('available');

    useEffect(() => {
        if (testApiUrlState !== 'inProgress') return;

        const controller = new AbortController();

        aims.getRoot({
            baseUrl: settings.serverUrl,
            controller,
            rateLimitBypassToken: settings.rateLimitBypassToken,
        })
            .then((res) => {
                if (res.success) {
                    setTestApiUrlState('success');
                } else if (res.data._code === 429) {
                    const response = res.data as RateLimitedResponse;
                    setTestApiUrlTitles({
                        ...testApiUrlTitles,
                        fail: `Rate Limited, try again in ${response.reset} seconds`,
                    });
                    setTestApiUrlState('fail');
                } else {
                    const response = res.data as { _code: number; statusText: string };
                    setTestApiUrlTitles({
                        ...testApiUrlTitles,
                        fail: `Error ${response._code}${response.statusText !== '' ? `: ${response.statusText}` : ''}`,
                    });
                    setTestApiUrlState('fail');
                }
            })
            .catch((err) => {
                if (err instanceof Error && err.name === 'CanceledError') {
                    setTestApiUrlState('available');
                } else {
                    setTestApiUrlTitles({
                        ...testApiUrlTitles,
                        fail: err instanceof Error ? err.message : 'Unknown error occurred (see console)',
                    });
                    setTestApiUrlState('fail');
                    console.error(err);
                }
            });

        return () => {
            controller.abort();
        };
    }, [settings.rateLimitBypassToken, settings.serverUrl, testApiUrlState, testApiUrlTitles]);

    useEffect(() => {
        if (testRateLimitState !== 'inProgress') return;

        const controller = new AbortController();

        aims.checkRateLimitResponse({
            baseUrl: settings.serverUrl,
            controller,
            rateLimitBypassToken: settings.rateLimitBypassToken,
        })
            .then((res) => {
                if (res.success) {
                    setTestRateLimitState('success');
                } else {
                    setTestRateLimitTitles({
                        ...testRateLimitTitles,
                        fail: res.data.message,
                    });
                    setTestRateLimitState('fail');
                }
            })
            .catch((err) => {
                if (err instanceof Error && err.name === 'CanceledError') {
                    setTestRateLimitState('available');
                } else {
                    setTestRateLimitTitles({
                        ...testRateLimitTitles,
                        fail: err instanceof Error ? err.message : 'Unknown error occurred (see console)',
                    });
                    setTestRateLimitState('fail');
                    console.error(err);
                }
            });

        return () => {
            controller.abort();
        };
    }, [settings.rateLimitBypassToken, settings.serverUrl, testRateLimitState, testRateLimitTitles]);

    const handleTestApiUrl = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (testApiUrlState === 'inProgress') {
                setTestApiUrlState('available');
            } else {
                setTestApiUrlState('inProgress');
            }
        },
        [testApiUrlState],
    );

    const handleTestRateLimit = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (testRateLimitState === 'inProgress') {
                setTestRateLimitState('available');
            } else {
                setTestRateLimitState('inProgress');
            }
        },
        [testRateLimitState],
    );

    useEffect(() => {
        setTestApiUrlState('available');
        setTestRateLimitState('available');
    }, [settings.serverUrl]);

    useEffect(() => {
        setTestRateLimitState('available');
    }, [settings.rateLimitBypassToken]);

    const [hideRateLimitToken, setHideRateLimitToken] = useState(true);

    return (
        <Container
            maxWidth="lg"
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
            <Typography variant="h2">
                Settings <SettingsCog />
            </Typography>
            <Grid container spacing={4} alignItems="center" sx={{ p: 5 }}>
                <SettingsItem
                    title="Endpoint for the AIMS API."
                    label="API URL"
                    value={settings.serverUrl}
                    handleChange={handleTextChange('serverUrl')}
                    handleReset={handleReset('serverUrl')}
                    isDefault={defaultSettings.serverUrl === settings.serverUrl}
                    inputMode="url"
                    test={{
                        state: testApiUrlState,
                        handleClick: handleTestApiUrl,
                        title: testApiUrlTitles,
                    }}
                />
                <SettingsItem
                    title="Rate limit bypass token for the AIMS API."
                    label="Rate Limit Bypass Token"
                    value={settings.rateLimitBypassToken}
                    handleChange={handleTextChange('rateLimitBypassToken')}
                    handleReset={handleReset('rateLimitBypassToken')}
                    isDefault={defaultSettings.rateLimitBypassToken === settings.rateLimitBypassToken}
                    test={{
                        state: testRateLimitState,
                        handleClick: handleTestRateLimit,
                        title: testRateLimitTitles,
                    }}
                    hide={{ hidden: hideRateLimitToken, setHidden: setHideRateLimitToken }}
                />
                <SettingsItem
                    title="ID of Discord application to use in OAuth."
                    label="Discord Application ID"
                    value={settings.discordApplicationId}
                    handleChange={handleTextChange('discordApplicationId')}
                    handleReset={handleReset('discordApplicationId')}
                    isDefault={defaultSettings.discordApplicationId === settings.discordApplicationId}
                    inputMode="numeric"
                />
                <SettingsItem
                    title="URI to redirect to after login attempt."
                    label="Login Redirect URI"
                    value={settings.redirectUri}
                    handleChange={handleTextChange('redirectUri')}
                    handleReset={handleReset('redirectUri')}
                    isDefault={defaultSettings.redirectUri === settings.redirectUri}
                    inputMode="url"
                />
                <SettingsItem
                    title="Will not try to refresh site token if it expires in less than this many seconds."
                    label="Min Refresh Threshold (Seconds)"
                    value={settings.minRefreshSeconds.toString()}
                    handleChange={handleNumberChange('minRefreshSeconds')}
                    handleReset={handleReset('minRefreshSeconds')}
                    isDefault={defaultSettings.minRefreshSeconds === settings.minRefreshSeconds}
                    inputMode="numeric"
                />
                <SettingsItem
                    title="Will try to refresh site token if it expires in this many minutes or less."
                    label="Max Refresh Threshold (Minutes)"
                    value={settings.maxRefreshMinutes.toString()}
                    handleChange={handleNumberChange('maxRefreshMinutes')}
                    handleReset={handleReset('maxRefreshMinutes')}
                    isDefault={defaultSettings.maxRefreshMinutes === settings.maxRefreshMinutes}
                    inputMode="numeric"
                />
            </Grid>
            <InternalLink to="/">
                <Button variant="outlined" color="secondary" sx={{ mt: 3 }} size="large">
                    Home
                </Button>
            </InternalLink>
        </Container>
    );
};