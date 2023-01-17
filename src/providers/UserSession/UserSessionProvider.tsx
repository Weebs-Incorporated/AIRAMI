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

            if (res.success) {
                setUser({ ...res.data, setAt: new Date().toISOString() });
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

            if (res.success) {
                setUser({ ...res.data, setAt: new Date().toISOString() });
            } else {
                setUser(null);
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

            if (res.success) {
                setUser(null);
            }

            return res;
        },
        [settings.rateLimitBypassToken, settings.serverUrl],
    );

    const finalValue = useMemo<IUserSessionContext>(() => {
        return { user, controllers: { requestLogin, requestRefresh, requestLogout } };
    }, [requestLogin, requestLogout, requestRefresh, user]);

    return <UserSessionContext.Provider value={finalValue}>{children}</UserSessionContext.Provider>;
};

export default UserSessionContextProvider;
