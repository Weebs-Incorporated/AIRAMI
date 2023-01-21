import { aims } from '../../api';
import { AIMS } from '../../types';

export interface UserSession extends AIMS.LoginResponse {
    setAt: string;
    firstSetAt: string;
}

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

    /** Updates this user's client-side permissions, call this after a successful patch request.  */
    updatePermissions(newPermissions: AIMS.UserPermissions): void;
}

export interface IUserSessionContext<TRequired extends boolean = false> {
    user: TRequired extends true ? UserSession : UserSession | null;
    controllers: UserSessionControllers;
}
