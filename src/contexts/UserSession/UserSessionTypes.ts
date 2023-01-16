import { aims } from '../../api';
import { AIMS } from '../../types';
import { RateLimited, RateLimitedResponse } from '../../types/CommonResponses';
import { BaseRequestProps } from '../../types/RequestTypes';
import { GenericFailResponse, Responsify, ServerResponse } from '../../types/ResponseTypes';

export type UserSession =
    | (AIMS.LoginResponse & {
          setAt: string;
      })
    | null;

export interface UserSessionControllers {
    /** Requests the server upgrade an authorization code to an access token. */
    requestLogin(authorizationCode: string, controller?: AbortController): ReturnType<(typeof aims)['requestLogin']>;

    /** Requests the server to fetch another access token. */
    requestRefresh(
        existingSession: Exclude<UserSession, null>,
        controller?: AbortController,
    ): ReturnType<(typeof aims)['requestRefresh']>;

    /** Requests the server revoke the current access token. */
    requestLogout(
        existingSession: Exclude<UserSession, null>,
        controller?: AbortController,
    ): ReturnType<(typeof aims)['requestLogout']>;
}

export interface IUserSessionContext {
    user: UserSession;
    controllers: UserSessionControllers;
}
