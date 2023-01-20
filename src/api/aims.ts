import axios, { isAxiosError } from 'axios';
import { AIMS, BaseRequestProps, RateLimitedResponse, Responsify, Root, RootResponse, ServerResponse } from '../types';
import { makeRequestConfig, unknownFailResponse, handleRateLimited, genericFailResponse } from './helpers';

export async function getRoot(
    props: BaseRequestProps<true, false>,
): Promise<ServerResponse<RootResponse, RateLimitedResponse>> {
    const config = makeRequestConfig(props, 'GET');

    try {
        const { data } = await axios.request<Root>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        return genericFailResponse(error.response);
    }
}

export async function checkRateLimitResponse(
    props: BaseRequestProps<true, false> & { rateLimitBypassToken: string },
): Promise<ServerResponse<Responsify<void, 200>, Responsify<'Error' | 'Invalid Token', 200>>> {
    const config = makeRequestConfig(props, 'GET');

    try {
        const { headers } = await axios.request(config);
        if (headers['ratelimit-bypass-response'] === 'Valid') {
            return { success: true, status: 200, data: undefined };
        }
        return { success: false, generic: false, status: 200, data: 'Invalid Token' };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return { success: false, generic: false, status: 200, data: 'Invalid Token' };

        return genericFailResponse(error.response);
    }
}

export async function requestLogin(
    props: BaseRequestProps<true, false>,
    authorizationCode: string,
    redirectUri: string,
): Promise<
    ServerResponse<
        Responsify<AIMS.LoginResponse, 200>,
        Responsify<string, 400 | 500> | RateLimitedResponse | Responsify<void, 501>
    >
> {
    const config = makeRequestConfig(props, 'POST', '/login');

    config.data = {
        code: authorizationCode,
        redirect_uri: redirectUri,
    };

    try {
        const { data } = await axios.request<AIMS.LoginResponse>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 400 || error.response.status === 500) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.statusText,
            };
        }

        if (error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function requestRefresh(
    props: BaseRequestProps<true, true>,
): Promise<
    ServerResponse<
        Responsify<AIMS.LoginResponse, 200>,
        Responsify<void, 400 | 404 | 501> | Responsify<string, 401 | 500> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', '/refresh');

    try {
        const { data } = await axios.request<AIMS.LoginResponse>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 400 || error.response.status === 404) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 500) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.statusText,
            };
        }

        if (error.response.status === 501) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function requestLogout(
    props: BaseRequestProps<true, true>,
): Promise<
    ServerResponse<Responsify<void, 200>, Responsify<void, 400> | Responsify<string, 401> | RateLimitedResponse>
> {
    const config = makeRequestConfig(props, 'GET', '/logout');

    try {
        await axios.request<void>(config);
        return { success: true, status: 200, data: undefined };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 400) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        return genericFailResponse(error.response);
    }
}

export async function getUser(
    props: BaseRequestProps<true, 'optional'>,
    id: string,
): Promise<
    ServerResponse<
        Responsify<AIMS.ClientFacingUser, 200>,
        Responsify<string, 401> | Responsify<void, 404> | RateLimitedResponse
    >
> {
    const config = makeRequestConfig(props, 'GET', `/users/${id}`);

    try {
        const { data } = await axios.request<AIMS.ClientFacingUser>(config);
        return { success: true, status: 200, data };
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response === undefined) return unknownFailResponse(error);

        const rateLimit = handleRateLimited(error.response);
        if (rateLimit) return rateLimit;

        if (error.response.status === 401) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: error.response.data['message'],
            };
        }

        if (error.response.status === 404) {
            return {
                success: false,
                generic: false,
                status: error.response.status,
                data: undefined,
            };
        }

        return genericFailResponse(error.response);
    }
}
