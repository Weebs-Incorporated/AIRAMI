import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { aims } from '../../api';
import {
    IUserSessionContext,
    SettingsContext,
    UserSession,
    UserSessionContext,
    UserSessionControllers,
} from '../../contexts';
import { BaseRequestProps } from '../../types/RequestTypes';
import { getLocalUserSession, saveLocalUserSession } from './UserSessionHelpers';

const UserSessionContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserSession | null>(getLocalUserSession);

    const { settings } = useContext(SettingsContext);

    useEffect(() => saveLocalUserSession(user), [user]);

    const requestLogin = useCallback<UserSessionControllers['requestLogin']>(
        async (authorizationCode, controller) => {
            const props: BaseRequestProps<true, false> = {
                baseURL: settings.serverUrl,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
                siteToken: undefined,
            };

            const res = await aims.requestLogin(props, authorizationCode, settings.redirectUri);

            if (res !== 'canceled' && res.success) {
                const now = new Date().toISOString();
                setUser({ ...res.data, setAt: now, firstSetAt: now });
            }

            return res;
        },
        [settings.rateLimitBypassToken, settings.redirectUri, settings.serverUrl],
    );

    const requestRefresh = useCallback<UserSessionControllers['requestRefresh']>(
        async (existingSession, controller) => {
            const props: BaseRequestProps<true, true> = {
                baseURL: settings.serverUrl,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
                siteToken: existingSession.siteToken,
            };

            const res = await aims.requestRefresh(props);

            if (res !== 'canceled') {
                if (res.success) {
                    setUser({ ...res.data, setAt: new Date().toISOString(), firstSetAt: existingSession.firstSetAt });
                } else {
                    setUser(null);
                }
            }

            return res;
        },
        [settings.rateLimitBypassToken, settings.serverUrl],
    );

    const requestLogout = useCallback<UserSessionControllers['requestLogout']>(
        async (existingSession, controller) => {
            const props: BaseRequestProps<true, true> = {
                baseURL: settings.serverUrl,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
                siteToken: existingSession.siteToken,
            };

            const res = await aims.requestLogout(props);

            if (res !== 'canceled' && (res.success || (!res.generic && res.status === 400))) {
                // a 400 response means the token provided was invalid, so we should count that as a success too since
                // the token in question can't be used anymore
                setUser(null);
            }

            return res;
        },
        [settings.rateLimitBypassToken, settings.serverUrl],
    );

    useEffect(() => {
        if (user === null) return;

        const expiryTimestamp = new Date(user.setAt).getTime() + 1000 * user.expiresInSeconds;
        const secondsTillExpiry = Math.floor((expiryTimestamp - Date.now()) / 1000);

        if (secondsTillExpiry < settings.minRefreshSeconds) {
            console.log(
                `[UserSession] Session expires too soon (in ${secondsTillExpiry} seconds, lowest acceptable is ${settings.minRefreshSeconds} seconds)`,
            );
            setUser(null);
            return;
        }

        const minsTillExpiry = Math.floor(secondsTillExpiry / 60);

        if (minsTillExpiry <= settings.maxRefreshMinutes) {
            console.log(
                `[UserSession] Session expires in ${minsTillExpiry} minutes, below the ${settings.maxRefreshMinutes} minute threshold; attempting refresh...`,
            );
            const controller = new AbortController();
            requestRefresh(user, controller).then((res) => {
                if (res === 'canceled') {
                    console.log('[UserSession] Background refresh aborted');
                } else if (res.success) {
                    console.log('[UserSession] Background refresh successful');
                } else {
                    console.log('[UserSession] Background refresh failed', res);
                }
            });

            return () => {
                controller.abort();
            };
        }

        const scheduledInMinutes = minsTillExpiry - settings.maxRefreshMinutes;

        console.log(
            `[UserSession] Session expires in ${minsTillExpiry} minutes, will attempt background refresh in ${scheduledInMinutes} minutes`,
        );

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            requestRefresh(user, controller).then((res) => {
                if (res === 'canceled') {
                    console.log('[UserSession] Background refresh aborted');
                } else if (res.success) {
                    console.log('[UserSession] Background refresh successful');
                } else {
                    console.log('[UserSession] Background refresh failed', res);
                }
            });
        }, scheduledInMinutes * 1000 * 60);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [requestRefresh, settings.maxRefreshMinutes, settings.minRefreshSeconds, user]);

    const finalValue = useMemo<IUserSessionContext>(() => {
        return { user, controllers: { requestLogin, requestRefresh, requestLogout } };
    }, [requestLogin, requestLogout, requestRefresh, user]);

    return <UserSessionContext.Provider value={finalValue}>{children}</UserSessionContext.Provider>;
};

export default UserSessionContextProvider;
