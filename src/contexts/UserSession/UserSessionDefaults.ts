import { AIMS } from '../../types';
import { RateLimited, RateLimitedResponse } from '../../types/CommonResponses';
import { Responsify, ServerResponse } from '../../types/ResponseTypes';
import { UserSessionControllers, IUserSessionContext } from './UserSessionTypes';

export const defaultUserSession = null;

export const defaultUserSessionControllers: UserSessionControllers = {
    requestLogin: function (
        authorizationCode: string,
        controller?: AbortController | undefined,
    ): Promise<
        ServerResponse<
            Responsify<AIMS.LoginResponse, 200>,
            Responsify<string, 400 | 500> | RateLimitedResponse | Responsify<void, 501>
        >
    > {
        throw new Error('Function not implemented.');
    },
    requestRefresh: function (
        existingSession: AIMS.LoginResponse & { setAt: string },
        controller?: AbortController | undefined,
    ): Promise<
        ServerResponse<
            Responsify<AIMS.LoginResponse, 200>,
            RateLimitedResponse | Responsify<void, 400 | 501 | 404> | Responsify<string, 500 | 401>
        >
    > {
        throw new Error('Function not implemented.');
    },
    requestLogout: function (
        existingSession: AIMS.LoginResponse & { setAt: string },
        controller?: AbortController | undefined,
    ): Promise<
        ServerResponse<Responsify<void, 200>, RateLimitedResponse | Responsify<void, 400> | Responsify<string, 401>>
    > {
        throw new Error('Function not implemented.');
    },
};

export const defaultUserSessionContext: IUserSessionContext = {
    user: defaultUserSession,
    controllers: defaultUserSessionControllers,
};
