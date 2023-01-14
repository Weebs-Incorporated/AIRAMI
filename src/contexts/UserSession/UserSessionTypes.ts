import { LoginResponse } from '../../types/AIMS';
import { RateLimitedResponse, ServerResponse } from '../../types/CommonResponses';

export interface UserSession extends LoginResponse {
    setAt: string;
}

export interface UserSessionControllers {
    /** Requests the server upgrade an authorization code to an access token. */
    requestLogin(
        authorizationCode: string,
        redirectUri: string,
    ): Promise<
        ServerResponse<
            true,
            { _code: 400 } | { _code: 404 } | RateLimitedResponse | { _code: 500; message: string } | { _code: 501 }
        >
    >;

    /** Requests the server to fetch another access token. */
    requestRefresh(
        siteToken: string,
    ): Promise<
        ServerResponse<
            true,
            | { _code: 400 }
            | { _code: 401; message: string }
            | { _code: 404 }
            | RateLimitedResponse
            | { _code: 500; message: string }
            | { _code: 501 }
        >
    >;

    /** Requests the server revoke the current access token. */
    requestLogout(siteToken: string): Promise<ServerResponse<true, { _code: 400 } | { _code: 401 } | { _code: 429 }>>;
}
